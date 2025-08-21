import { NextResponse } from 'next/server';

// Simple in-memory metrics storage (in production, use Redis or database)
let metrics = {
  requests: 0,
  errors: 0,
  startTime: Date.now(),
  lastRequest: 0,
};

// Update metrics
export function updateMetrics(success: boolean = true) {
  metrics.requests++;
  if (!success) metrics.errors++;
  metrics.lastRequest = Date.now();
}

export async function GET() {
  try {
    const uptime = Date.now() - metrics.startTime;
    const errorRate = metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0;
    
    // Prometheus format metrics
    const prometheusMetrics = [
      '# HELP fixmo_requests_total Total number of requests',
      '# TYPE fixmo_requests_total counter',
      `fixmo_requests_total ${metrics.requests}`,
      '',
      '# HELP fixmo_errors_total Total number of errors',
      '# TYPE fixmo_errors_total counter',
      `fixmo_errors_total ${metrics.errors}`,
      '',
      '# HELP fixmo_error_rate Error rate percentage',
      '# TYPE fixmo_error_rate gauge',
      `fixmo_error_rate ${errorRate}`,
      '',
      '# HELP fixmo_uptime_seconds Application uptime in seconds',
      '# TYPE fixmo_uptime_seconds gauge',
      `fixmo_uptime_seconds ${Math.floor(uptime / 1000)}`,
      '',
      '# HELP fixmo_last_request_timestamp Timestamp of last request',
      '# TYPE fixmo_last_request_timestamp gauge',
      `fixmo_last_request_timestamp ${metrics.lastRequest}`,
      '',
      '# HELP fixmo_memory_usage_bytes Memory usage in bytes',
      '# TYPE fixmo_memory_usage_bytes gauge',
      `fixmo_memory_usage_bytes ${process.memoryUsage().heapUsed}`,
      '',
      '# HELP fixmo_memory_heap_total_bytes Total heap memory in bytes',
      '# TYPE fixmo_memory_heap_total_bytes gauge',
      `fixmo_memory_heap_total_bytes ${process.memoryUsage().heapTotal}`,
      '',
      '# HELP fixmo_memory_external_bytes External memory in bytes',
      '# TYPE fixmo_memory_external_bytes gauge',
      `fixmo_memory_external_bytes ${process.memoryUsage().external}`,
      '',
      '# HELP fixmo_process_uptime_seconds Process uptime in seconds',
      '# TYPE fixmo_process_uptime_seconds gauge',
      `fixmo_process_uptime_seconds ${process.uptime()}`,
      '',
      '# HELP fixmo_nodejs_version_info Node.js version info',
      '# TYPE fixmo_nodejs_version_info gauge',
      `fixmo_nodejs_version_info{version="${process.version}"} 1`,
      '',
      '# HELP fixmo_environment_info Environment information',
      '# TYPE fixmo_environment_info gauge',
      `fixmo_environment_info{env="${process.env.NODE_ENV || 'development'}"} 1`,
    ].join('\n');

    return new NextResponse(prometheusMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    
    return new NextResponse(
      `# HELP fixmo_metrics_error Error in metrics collection
# TYPE fixmo_metrics_error gauge
fixmo_metrics_error 1`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}

// Custom metrics endpoint for application-specific metrics
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metric, value, labels = {} } = body;
    
    // In a real implementation, you would store these metrics in Redis or a database
    console.log(`Custom metric: ${metric} = ${value}`, labels);
    
    return NextResponse.json({ success: true, metric, value, labels });
  } catch (error) {
    console.error('Custom metrics error:', error);
    return NextResponse.json(
      { error: 'Invalid metrics data' },
      { status: 400 }
    );
  }
} 