
"use client"
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star 
} from "lucide-react";
import Link from "next/link";
import TaskCard from "@/components/task-card";
import MeetingBubbles from "@/components/meeting-bubbles";
import { LocationPermission } from '@/components/location-permission';
import { AdvancedSearch, type SearchFilters } from '@/components/advanced-search';
import type { Task } from '@/types';

const features = [
  {
    icon: Shield,
    title: "Verified Community",
    description: "Advanced Fixmotech AI verification ensures everyone is real and trustworthy"
  },
  {
    icon: Users,
    title: "Local Connections",
    description: "Connect with trusted neighbors in your area for tasks and services"
  },
  {
    icon: Zap,
    title: "Quick & Easy",
    description: "Post tasks or offer services in minutes with our streamlined platform"
  }
];

const stats = [
  { label: "Active Users", value: "10,000+", icon: Users },
  { label: "Tasks Completed", value: "50,000+", icon: CheckCircle },
  { label: "Average Rating", value: "4.8/5", icon: Star }
];

export default function Home() {
  const [posts, setPosts] = useState<Task[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    category: 'all',
    location: '',
    priceRange: { min: 0, max: 100000 },
    type: 'all',
    sortBy: 'relevance'
  });

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Task));
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
      setLoading(false);
    };
    
    fetchPosts();
  }, []);

  // Filter posts based on search term and filters
  useEffect(() => {
    let filtered = [...posts];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(post => post.category === currentFilters.category);
    }

    // Type filter
    if (currentFilters.type !== 'all') {
      filtered = filtered.filter(post => post.type === currentFilters.type);
    }

    // Location filter
    if (currentFilters.location.trim()) {
      filtered = filtered.filter(post =>
        post.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(post => 
      post.pay >= currentFilters.priceRange.min && post.pay <= currentFilters.priceRange.max
    );

    // Sort posts
    filtered.sort((a, b) => {
      switch (currentFilters.sortBy) {
        case 'price-low':
          return a.pay - b.pay;
        case 'price-high':
          return b.pay - a.pay;
        case 'date-new':
          return b.createdAt.toDate ? b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime() : 0;
        case 'date-old':
          return a.createdAt.toDate ? a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime() : 0;
        default:
          return 0; // relevance - keep original order
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, currentFilters]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleFiltersChange = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentFilters({
      category: 'all',
      location: '',
      priceRange: { min: 0, max: 100000 },
      type: 'all',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = searchTerm || 
    currentFilters.category !== 'all' || 
    currentFilters.type !== 'all' || 
    currentFilters.location || 
    currentFilters.priceRange.min > 0 || 
    currentFilters.priceRange.max < 100000 || 
    currentFilters.sortBy !== 'relevance';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <MeetingBubbles />
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Fixmotech
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                Secure
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                Community
              </Badge>
            </div>
            <h1 className="text-5xl lg:text-6xl font-headline font-bold tracking-tight mb-6">
              Find Help, Offer Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your trusted neighborhood marketplace for tasks and skills. Connect with verified neighbors in your community.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="flex items-center gap-2 h-12 px-8" asChild>
                <Link href="/post">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="/signup">
                  Join Community
                </Link>
              </Button>
            </div>
            
            <div className="flex justify-center">
              <LocationPermission />
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-4">
              Why Choose FixMo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the most trusted platform for community connections
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Posts Section */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-4">
              Browse Available Tasks & Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Find what you need or offer your skills to the community
            </p>
          </div>

          <div className="mb-8">
            <AdvancedSearch 
              onSearch={handleSearch}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {posts.length} posts
            {hasActiveFilters && (
              <span className="ml-2 text-primary">
                (filtered results)
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[220px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
             <div className="text-center col-span-full py-12">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {hasActiveFilters ? 'No Posts Match Your Filters' : 'No Available Posts'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {hasActiveFilters 
                    ? 'Try adjusting your search terms or filters to find more results.'
                    : 'It looks quiet right now. Why not be the first to post a task or offer a service?'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <>
                      <Button asChild>
                        <Link href="/post">Post a Task</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/post?type=service">Offer a Service</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPosts.map((post) => (
                <TaskCard key={post.id} task={post} />
              ))}
            </div>
          )}

          {/* View More Button */}
          {posts.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">
                  View All Posts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary/10 to-blue-500/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users helping each other in their communities every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="flex items-center gap-2 h-12 px-8" asChild>
              <Link href="/signup">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8" asChild>
              <Link href="/post">
                Post Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
