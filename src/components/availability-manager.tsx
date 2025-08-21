"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Save, Loader2 } from 'lucide-react';
import { AvailabilitySlot } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AvailabilityManagerProps {
  taskerId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export function AvailabilityManager({ taskerId }: AvailabilityManagerProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailabilitySlots();
  }, [taskerId]);

  const fetchAvailabilitySlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/availability?taskerId=${taskerId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailabilitySlots(data.availabilitySlots || []);
      }
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      toast({
        title: "Error",
        description: "Failed to load availability slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAvailabilitySlots = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/appointments/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskerId,
          slots: availabilitySlots
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Availability slots updated successfully",
        });
      } else {
        throw new Error('Failed to save availability slots');
      }
    } catch (error) {
      console.error('Error saving availability slots:', error);
      toast({
        title: "Error",
        description: "Failed to save availability slots",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSlot = (dayOfWeek: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailabilitySlots(prev => {
      const existingSlot = prev.find(slot => slot.dayOfWeek === dayOfWeek);
      
      if (existingSlot) {
        return prev.map(slot => 
          slot.dayOfWeek === dayOfWeek 
            ? { ...slot, [field]: value }
            : slot
        );
      } else {
        return [...prev, {
          id: undefined,
          taskerId,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          [field]: value
        }];
      }
    });
  };

  const getSlotForDay = (dayOfWeek: number): AvailabilitySlot | null => {
    return availabilitySlots.find(slot => slot.dayOfWeek === dayOfWeek) || null;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading availability...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Availability</h2>
          <p className="text-muted-foreground">
            Set your working hours for each day of the week
          </p>
        </div>
        <Button onClick={saveAvailabilitySlots} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const slot = getSlotForDay(day.value);
          const isAvailable = slot?.isAvailable ?? false;

          return (
            <Card key={day.value}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{day.label}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          checked={isAvailable}
                          onCheckedChange={(checked) => updateSlot(day.value, 'isAvailable', checked)}
                        />
                        <Label className="text-sm">
                          {isAvailable ? 'Available' : 'Not Available'}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {isAvailable && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot?.startTime || '09:00'}
                            onChange={(e) => updateSlot(day.value, 'startTime', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={slot?.endTime || '17:00'}
                            onChange={(e) => updateSlot(day.value, 'endTime', e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {slot?.startTime && slot?.endTime 
                          ? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
                          : 'Set hours'
                        }
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Tips for setting availability:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Set realistic working hours that you can consistently maintain</li>
          <li>• Consider travel time between appointments</li>
          <li>• Leave some buffer time for unexpected delays</li>
          <li>• Update your availability if your schedule changes</li>
        </ul>
      </div>
    </div>
  );
} 