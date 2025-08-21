terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
  
  backend "gcs" {
    bucket = "fixmo-terraform-state"
    prefix = "terraform/state"
  }
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "fixmo-production"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "storage.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  
  service = each.value
  disable_dependent_services = true
}

# VPC Network
resource "google_compute_network" "fixmo_vpc" {
  name                    = "fixmo-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  
  depends_on = [google_project_service.required_apis]
}

# Subnet
resource "google_compute_subnetwork" "fixmo_subnet" {
  name          = "fixmo-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.fixmo_vpc.id
  region        = var.region
  
  # Enable flow logs for network monitoring
  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling       = 0.5
    metadata            = "INCLUDE_ALL_METADATA"
  }
}

# Cloud Storage bucket for static assets
resource "google_storage_bucket" "fixmo_static" {
  name          = "fixmo-static-assets-${random_id.bucket_suffix.hex}"
  location      = var.region
  force_destroy = false
  
  # Versioning for backup
  versioning {
    enabled = true
  }
  
  # Lifecycle management
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
  
  # Public access for static assets
  uniform_bucket_level_access = true
}

# Random ID for bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Cloud Run service for the application
resource "google_cloud_run_service" "fixmo_app" {
  name     = "fixmo-app"
  location = var.region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/fixmo:latest"
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "NEXT_TELEMETRY_DISABLED"
          value = "1"
        }
        
        ports {
          container_port = 3000
        }
      }
      
      # Service account for the Cloud Run service
      service_account_name = google_service_account.cloud_run_sa.email
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.required_apis]
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "fixmo-cloud-run-sa"
  display_name = "FixMo Cloud Run Service Account"
}

# IAM policy for Cloud Run service account
resource "google_project_iam_member" "cloud_run_sa_roles" {
  for_each = toset([
    "roles/run.invoker",
    "roles/storage.objectViewer",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Load Balancer
resource "google_compute_global_forwarding_rule" "fixmo_lb" {
  name       = "fixmo-load-balancer"
  target     = google_compute_target_http_proxy.fixmo_proxy.id
  port_range = "80"
  
  depends_on = [google_project_service.required_apis]
}

# HTTP proxy
resource "google_compute_target_http_proxy" "fixmo_proxy" {
  name    = "fixmo-http-proxy"
  url_map = google_compute_url_map.fixmo_url_map.id
}

# URL map
resource "google_compute_url_map" "fixmo_url_map" {
  name            = "fixmo-url-map"
  default_service = google_compute_backend_service.fixmo_backend.id
  
  # Health check path
  host_rule {
    hosts        = ["*"]
    path_matcher = "allpaths"
  }
  
  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.fixmo_backend.id
  }
}

# Backend service
resource "google_compute_backend_service" "fixmo_backend" {
  name        = "fixmo-backend"
  protocol    = "HTTP"
  port_name   = "http"
  timeout_sec = 30
  
  backend {
    group = google_compute_region_network_endpoint_group.fixmo_neg.id
  }
  
  health_checks = [google_compute_health_check.fixmo_health_check.id]
}

# Network endpoint group for Cloud Run
resource "google_compute_region_network_endpoint_group" "fixmo_neg" {
  name                  = "fixmo-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_service.fixmo_app.name
  }
}

# Health check
resource "google_compute_health_check" "fixmo_health_check" {
  name = "fixmo-health-check"
  
  http_health_check {
    port = 3000
    request_path = "/api/health"
  }
  
  timeout_sec        = 5
  check_interval_sec = 30
}

# Cloud CDN
resource "google_compute_backend_bucket" "fixmo_cdn" {
  name        = "fixmo-cdn-backend"
  bucket_name = google_storage_bucket.fixmo_static.name
  enable_cdn  = true
  
  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 86400
    max_ttl           = 604800
    negative_caching  = true
    serve_while_stale = 86400
  }
}

# Cloud Armor security policy
resource "google_compute_security_policy" "fixmo_security_policy" {
  name = "fixmo-security-policy"
  
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Deny access by default"
  }
  
  rule {
    action   = "allow"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["0.0.0.0/0"]
      }
    }
    description = "Allow access from all sources"
  }
  
  # Adaptive protection
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
      rule_visibility = "STANDARD"
    }
  }
}

# Monitoring workspace
resource "google_monitoring_workspace" "fixmo_workspace" {
  display_name = "FixMo Monitoring Workspace"
  
  depends_on = [google_project_service.required_apis]
}

# Logging sink
resource "google_logging_project_sink" "fixmo_logs" {
  name        = "fixmo-logs-sink"
  destination = "storage.googleapis.com/${google_storage_bucket.fixmo_logs.name}"
  
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"fixmo-app\""
  
  unique_writer_identity = true
}

# Storage bucket for logs
resource "google_storage_bucket" "fixmo_logs" {
  name          = "fixmo-logs-${random_id.bucket_suffix.hex}"
  location      = var.region
  force_destroy = false
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Outputs
output "cloud_run_url" {
  value = google_cloud_run_service.fixmo_app.status[0].url
}

output "load_balancer_ip" {
  value = google_compute_global_forwarding_rule.fixmo_lb.ip_address
}

output "static_bucket" {
  value = google_storage_bucket.fixmo_static.name
} 