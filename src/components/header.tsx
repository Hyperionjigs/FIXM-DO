
"use client";

import Link from "next/link";
import { Menu, X, LogOut, User as UserIcon, CheckCircle, Loader2, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHeaderState } from "@/hooks/use-header-state";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { VerificationModal } from "@/components/verification-modal";
import { UserBadge } from "@/components/user-badge";
import { BadgeSystem } from "@/lib/badge-system";
import { NotificationBell } from "@/components/notification-bell";
import { useLocation } from "@/hooks/use-location";
import { MapPin, RefreshCw } from "lucide-react";
import { isAdmin } from "@/lib/admin-config";

const navItems = [
  { href: "/post", label: "Post" },
  { href: "/messages", label: "Messages" },
  { href: "/notifications", label: "Notifications" },
  { href: "/test-bonus", label: "Bonus System" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [userVerificationStatus, setUserVerificationStatus] = useState<{ photoVerified: boolean } | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const { isAtTop, hasScrolled } = useHeaderState();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { location, loading: locationLoading, refreshLocation } = useLocation();

  // Log user info for admin setup
  useEffect(() => {
    if (user) {
      console.log('User Info for Admin Setup:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAdmin: isAdmin(user.uid, user.email)
      });
    }
  }, [user]);

  // Fetch user verification status and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Fetch user verification status
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserVerificationStatus({
            photoVerified: userData.photoVerified || false
          });
        }

        // Fetch user stats for badges
        try {
          const tasksQuery = query(
            collection(db, "posts"), 
            where("authorId", "==", user.uid)
          );
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const completedTasks = tasks.filter((task: any) => task.status === 'completed');
          const averageRating = completedTasks.length > 0 
            ? completedTasks.reduce((acc: number, task: any) => acc + (task.rating || 0), 0) / completedTasks.length 
            : 0;

          const stats = {
            tasksCompleted: completedTasks.length,
            averageRating,
            totalReviews: completedTasks.length,
            positiveReviews: completedTasks.filter((task: any) => (task.rating || 0) >= 4).length,
            responseRate: 100, // Default for now
            completionRate: 100, // Default for now
            profileVerified: userData?.emailVerified || false,
            photoVerified: userData?.photoVerified || false,
            mentorshipCount: 0, // Default for now
            staffRecognition: false, // Default for now
            firstTaskPosted: tasks.length > 0,
            firstTaskAccepted: tasks.length > 0,
            firstTaskCompleted: completedTasks.length > 0
          };
          
          setUserStats(stats);
        } catch (error) {
          console.error('Error fetching user stats:', error);
          // Set default stats
          setUserStats({
            tasksCompleted: 0,
            averageRating: 0,
            totalReviews: 0,
            positiveReviews: 0,
            responseRate: 100,
            completionRate: 100,
            profileVerified: userData?.emailVerified || false,
            photoVerified: userData?.photoVerified || false,
            mentorshipCount: 0,
            staffRecognition: false,
            firstTaskPosted: false,
            firstTaskAccepted: false,
            firstTaskCompleted: false
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user?.uid]);



  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  }

  // Show login/signup buttons if user is not authenticated or still loading
  const showAuthButtons = !user && !loading;

  // Get CSS classes based on scroll state
  const getHeaderClasses = () => {
    return `sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
      isAtTop ? '' : 'fixmo-header scrolled'
    }`;
  };

  const getHeaderContentClasses = () => {
    return `relative rounded-2xl border bg-card/80 p-2 shadow-lg backdrop-blur-xl ${
      isAtTop ? '' : 'fixmo-header-content scrolled'
    }`;
  };

  const getNavClasses = () => {
    return `flex items-center justify-between ${
      isAtTop ? '' : 'fixmo-nav scrolled'
    }`;
  };

  const getLogoClasses = () => {
    return `text-xl font-bold text-primary ${
      isAtTop ? '' : 'fixmo-logo scrolled'
    }`;
  };

  const getControlsClasses = () => {
    return `flex items-center gap-4 ${
      isAtTop ? '' : 'fixmo-controls scrolled'
    }`;
  };

  return (
    <header className={getHeaderClasses()}>
      <div className={getHeaderContentClasses()}>
        <nav className={getNavClasses()}>
          {/* Logo and Location */}
          <div className="flex flex-col items-start">
            <Link href="/" className={getLogoClasses()}>
              FixMo
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              {locationLoading ? (
                <span className="text-xs text-muted-foreground">Getting location...</span>
              ) : location ? (
                <span className="text-xs text-muted-foreground">
                  {location.city}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Location unavailable</span>
              )}
              <button
                onClick={refreshLocation}
                className="ml-1 p-0.5 hover:bg-muted rounded transition-colors"
                title="Refresh location"
              >
                <RefreshCw className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className={`hidden items-center gap-2 md:flex ${isAtTop ? '' : 'flex-col'}`}>
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" className={isAtTop ? '' : 'nav-item'} size={isAtTop ? 'default' : 'sm'}>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
             {user && (
              <Button asChild variant="ghost" className={isAtTop ? '' : 'nav-item'} size={isAtTop ? 'default' : 'sm'}>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
          

          
          {/* User Controls */}
          <div className={getControlsClasses()}>
             <ThemeToggle />

            {loading ? (
              // Loading state
              <div className={`flex items-center gap-2 ${isAtTop ? '' : 'flex-col'}`}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className={`text-sm text-muted-foreground ${isAtTop ? 'hidden md:inline' : 'hidden'}`}>Loading...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Welcome message and status indicator */}
                <div className="hidden md:flex items-center gap-2">
                  {userStats && (
                    <UserBadge 
                      userStats={BadgeSystem.calculateUserStats(userStats)}
                      size="sm" 
                      showTooltip={false}
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}!
                  </span>
                </div>
                
                {/* Notification bell */}
                <NotificationBell />
                
                {/* User avatar with dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer ring-2 ring-green-500/20 hover:ring-green-500/40 transition-all h-10 w-10 flex-shrink-0">
                      <AvatarImage 
                        src={user.photoURL || "https://placehold.co/40x40"} 
                        alt={user.displayName || "User"} 
                        data-ai-hint="profile person"
                        className="object-cover aspect-square"
                      />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuLabel className="flex items-center gap-2">
                       {userStats && (
                         <UserBadge 
                           userStats={BadgeSystem.calculateUserStats(userStats)}
                           size="sm" 
                           showTooltip={false}
                         />
                       )}
                       <span>{user.displayName || user.email}</span>
                     </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                                          <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.uid}`}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                     </DropdownMenuItem>

                     <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <span>Dashboard</span>
                        </Link>
                     </DropdownMenuItem>
                     {user && isAdmin(user.uid, user.email) && (
                       <DropdownMenuItem asChild>
                         <Link href="/admin">
                           <span>Admin Dashboard</span>
                         </Link>
                       </DropdownMenuItem>
                     )}
                     <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button asChild variant="ghost">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
           
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
          

        </nav>
        {mobileMenuOpen && (
          <div className="mt-4 flex flex-col gap-2 md:hidden">
            {/* Mobile loading state */}
            {loading && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            
            {/* Mobile logged in indicator */}
            {user && userStats && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-2">
                <UserBadge 
                  userStats={BadgeSystem.calculateUserStats(userStats)}
                  size="sm" 
                  showTooltip={false}
                />
                <span className="text-sm font-medium">Logged In as {user.displayName || user.email?.split('@')[0] || 'User'}</span>
              </div>
            )}
            
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="justify-start">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
             { user ? (
               <>
                 <Button asChild variant="ghost" className="justify-start">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  {user && isAdmin(user.uid, user.email) && (
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                  )}

               </>
             ) : (
              <>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/login">Log In</Link>
                </Button>
                 <Button asChild className="justify-start">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Verification Modal */}
      {/* Temporarily disabled to prevent CORS errors
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
      />
      */}
    </header>
  );
}
