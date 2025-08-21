"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PotMoneyDonation from "@/components/pot-money-donation";
import PaymentBreakdown from "@/components/payment-breakdown";
import { BonusService } from "@/lib/bonus-service";
import { getPHPSymbol } from "@/lib/currency-utils";

export default function TestBonusPage() {
  const [testTaskId, setTestTaskId] = useState("test-task-123");
  const [testTaskerId, setTestTaskerId] = useState("test-tasker-456");
  const [testTaskerName, setTestTaskerName] = useState("John Doe");
  const [testClientId, setTestClientId] = useState("test-client-789");
  const [testClientName, setTestClientName] = useState("Jane Smith");
  const [testAmount, setTestAmount] = useState("500");
  const [testTip, setTestTip] = useState("50");
  const [calculatedBonus, setCalculatedBonus] = useState<any>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any>(null);
  const { toast } = useToast();

  const testBonusCalculation = async () => {
    try {
      const bonus = await BonusService.calculateBonus(
        testTaskId,
        testTaskerId,
        testTaskerName,
        testClientId,
        testClientName,
        parseFloat(testAmount),
        parseFloat(testTip)
      );

      setCalculatedBonus(bonus);

      if (bonus) {
        toast({
          title: "Bonus Calculated!",
          description: `Random bonus of ${getPHPSymbol()}${bonus.bonusAmount.toFixed(2)} calculated.`,
        });
      } else {
        toast({
          title: "No Bonus",
          description: "No bonus was triggered for this task.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to calculate bonus.",
      });
    }
  };

  const testBonusProcessing = async () => {
    if (!calculatedBonus) {
      toast({
        variant: "destructive",
        title: "No Bonus",
        description: "Please calculate a bonus first.",
      });
      return;
    }

    try {
      const breakdown = await BonusService.processBonus(calculatedBonus);
      setPaymentBreakdown(breakdown);

      if (breakdown) {
        toast({
          title: "Bonus Processed!",
          description: `Payment breakdown created. Total: ${getPHPSymbol()}${breakdown.totalAmount.toLocaleString()}`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process bonus.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bonus System Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Task ID</Label>
                <Input
                  value={testTaskId}
                  onChange={(e) => setTestTaskId(e.target.value)}
                />
              </div>
              <div>
                <Label>Tasker ID</Label>
                <Input
                  value={testTaskerId}
                  onChange={(e) => setTestTaskerId(e.target.value)}
                />
              </div>
              <div>
                <Label>Tasker Name</Label>
                <Input
                  value={testTaskerName}
                  onChange={(e) => setTestTaskerName(e.target.value)}
                />
              </div>
              <div>
                <Label>Client ID</Label>
                <Input
                  value={testClientId}
                  onChange={(e) => setTestClientId(e.target.value)}
                />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input
                  value={testClientName}
                  onChange={(e) => setTestClientName(e.target.value)}
                />
              </div>
              <div>
                <Label>Task Amount ({getPHPSymbol()})</Label>
                <Input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Tip Amount ({getPHPSymbol()})</Label>
                <Input
                  type="number"
                  value={testTip}
                  onChange={(e) => setTestTip(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={testBonusCalculation} className="flex-1">
                  Calculate Bonus
                </Button>
                <Button
                  onClick={testBonusProcessing}
                  disabled={!calculatedBonus}
                  className="flex-1"
                >
                  Process Bonus
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calculated Bonus Display */}
          {calculatedBonus && (
            <Card>
              <CardHeader>
                <CardTitle>Calculated Bonus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Base Amount:</strong> {getPHPSymbol()}{calculatedBonus.baseTaskAmount}</p>
                  <p><strong>Bonus Amount:</strong> {getPHPSymbol()}{calculatedBonus.bonusAmount.toFixed(2)}</p>
                  <p><strong>Tip Amount:</strong> {getPHPSymbol()}{calculatedBonus.tipAmount || 0}</p>
                  <p><strong>Total Amount:</strong> {getPHPSymbol()}{calculatedBonus.totalAmount.toFixed(2)}</p>
                  <p><strong>Final Amount:</strong> {getPHPSymbol()}{calculatedBonus.finalAmount.toFixed(2)}</p>
                  <p><strong>Bonus Percentage:</strong> {(calculatedBonus.bonusPercentage * 100).toFixed(1)}%</p>
                  <p><strong>Pot Money Available:</strong> {getPHPSymbol()}{calculatedBonus.potMoneyAvailable.toFixed(2)}</p>
                  <p><strong>Randomly Triggered:</strong> {calculatedBonus.isRandomlyTriggered ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Breakdown Display */}
        <div className="space-y-6">
          {paymentBreakdown && (
            <PaymentBreakdown breakdown={paymentBreakdown} />
          )}

          {/* Pot Money Donation */}
          <PotMoneyDonation />
        </div>
      </div>
    </div>
  );
} 