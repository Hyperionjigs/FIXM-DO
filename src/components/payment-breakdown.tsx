"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Star, TrendingUp } from "lucide-react";
import { getPHPSymbol } from "@/lib/currency-utils";
import type { PaymentBreakdown } from "@/types";

interface PaymentBreakdownProps {
  breakdown: PaymentBreakdown;
  showDetails?: boolean;
}

export default function PaymentBreakdown({ breakdown, showDetails = true }: PaymentBreakdownProps) {
  const hasBonus = breakdown.bonusAmount > 0;
  const hasTip = breakdown.tipAmount > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl font-bold text-green-600">{getPHPSymbol()}</span>
          Payment Breakdown
          {hasBonus && (
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Gift className="h-3 w-3 mr-1" />
              Bonus Applied
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Payment */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">{getPHPSymbol()}</span>
            </div>
            <div>
              <p className="font-medium">{breakdown.breakdown.basePayment.description}</p>
              <p className="text-sm text-muted-foreground">Base task payment</p>
            </div>
          </div>
          <p className="font-bold text-lg">{getPHPSymbol()}{breakdown.basePayment.toLocaleString()}</p>
        </div>

        {/* Bonus */}
        {hasBonus && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-orange-600">
                    {breakdown.breakdown.bonus.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Random bonus from pot money
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-orange-600">
                  +{getPHPSymbol()}{breakdown.bonusAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((breakdown.bonusAmount / (breakdown.basePayment + breakdown.bonusAmount)) * 100).toFixed(1)}% bonus
                </p>
              </div>
            </div>
          </>
        )}

        {/* Tip */}
        {hasTip && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-600">
                    {breakdown.breakdown.tip.description}
                  </p>
                  <p className="text-sm text-muted-foreground">Client appreciation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-green-600">
                  +{getPHPSymbol()}{breakdown.tipAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <p className="font-bold text-lg">Total Payment</p>
          </div>
          <p className="font-bold text-2xl text-primary">
            {getPHPSymbol()}{breakdown.totalAmount.toLocaleString()}
          </p>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge 
            variant={breakdown.status === 'completed' ? 'default' : 'secondary'}
            className={breakdown.status === 'completed' ? 'bg-green-500' : ''}
          >
            {breakdown.status.charAt(0).toUpperCase() + breakdown.status.slice(1)}
          </Badge>
        </div>

        {/* Additional Details */}
        {showDetails && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Payment Details</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Task ID: {breakdown.taskId}</p>
              <p>Tasker: {breakdown.taskerName}</p>
              <p>Client: {breakdown.clientName}</p>
              <p>Processed: {breakdown.completedAt?.toDate().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 