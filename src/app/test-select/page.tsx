"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestSelectPage() {
  const [value, setValue] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Select</label>
              <Select 
                value={value} 
                onValueChange={(newValue) => {
                  console.log('Select value changed:', newValue);
                  setValue(newValue);
                }}
                onOpenChange={(open) => {
                  console.log('Select open state:', open);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Category Select (from post page)</label>
              <Select 
                value={value} 
                onValueChange={(newValue) => {
                  console.log('Category selected:', newValue);
                  setValue(newValue);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home Services">Home Services</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                  <SelectItem value="Tutoring">Tutoring</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Current value: {value || 'none'}
              </p>
              <Button 
                onClick={() => {
                  console.log('Current value:', value);
                  console.log('Setting to Home Services');
                  setValue('Home Services');
                }}
                className="mt-2"
              >
                Set to Home Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 