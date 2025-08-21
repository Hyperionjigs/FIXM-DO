"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, TrendingUp, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPHPSymbol, formatPHP } from "@/lib/currency-utils";

interface PotMoneyStats {
  totalAmount: number;
  totalDonations: number;
  totalBonusesPaid: number;
  activeBonuses: number;
}

export default function PotMoneyDonation() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PotMoneyStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { toast } = useToast();

  // Predefined donation amounts
  const quickAmounts = [50, 100, 200, 500, 1000];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pot-money/donate');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching pot money stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDonation = async (donationAmount?: number) => {
    const finalAmount = donationAmount || parseFloat(amount);
    
    if (!finalAmount || finalAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount.'
      });
      return;
    }

    if (finalAmount > 10000) {
      toast({
        variant: 'destructive',
        title: 'Amount Too High',
        description: `Maximum donation amount is ${getPHPSymbol()}10,000.`
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/pot-money/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Thank You!',
          description: data.message,
        });
        setAmount("");
        fetchStats(); // Refresh stats
      } else {
        toast({
          variant: 'destructive',
          title: 'Donation Failed',
          description: data.error || 'Failed to process donation.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process donation. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDonation = (quickAmount: number) => {
    handleDonation(quickAmount);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Gift className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl">Support Taskers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Donate to the pot money and help taskers earn extra bonuses!
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Pot Money Stats */}
        {!isLoadingStats && stats && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {getPHPSymbol()}{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Current Pot Money</p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-green-600">
                  {getPHPSymbol()}{stats.totalBonusesPaid.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Bonuses Paid</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-600">
                  {stats.activeBonuses}
                </p>
                <p className="text-xs text-muted-foreground">Active Bonuses</p>
              </div>
            </div>
          </div>
        )}

        {/* Donation Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Donation Amount ({getPHPSymbol()})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="10000"
              className="mt-1"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Quick Amounts
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDonation(quickAmount)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {getPHPSymbol()}{quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleDonation()}
            disabled={isLoading || !amount}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Heart className="h-4 w-4 mr-2 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Donate & Support
              </>
            )}
          </Button>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            How It Works
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 30% chance of bonus on task completion</li>
            <li>• Bonuses range from 1% to 10% of pot money</li>
            <li>• Maximum bonus: {getPHPSymbol()}500 per task</li>
            <li>• Minimum task amount: {getPHPSymbol()}100 to be eligible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 