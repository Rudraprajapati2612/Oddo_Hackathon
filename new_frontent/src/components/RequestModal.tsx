import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    skillsWanted: string[];
  };
  currentUserSkills: string[];
  onSubmit: (request: {
    offeredSkill: string;
    wantedSkill: string;
    message: string;
  }) => void;
}

export function RequestModal({
  isOpen,
  onClose,
  targetUser,
  currentUserSkills,
  onSubmit,
}: RequestModalProps) {
  const [offeredSkill, setOfferedSkill] = useState('');
  const [wantedSkill, setWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkill || !wantedSkill || !message.trim()) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        offeredSkill,
        wantedSkill,
        message: message.trim(),
      });
      
      // Reset form
      setOfferedSkill('');
      setWantedSkill('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Skill Swap Request to {targetUser.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offered Skill */}
          <div className="space-y-2">
            <Label htmlFor="offered-skill">I can teach:</Label>
            <Select value={offeredSkill} onValueChange={setOfferedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you offer" />
              </SelectTrigger>
              <SelectContent>
                {currentUserSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wanted Skill */}
          <div className="space-y-2">
            <Label htmlFor="wanted-skill">I want to learn:</Label>
            <Select value={wantedSkill} onValueChange={setWantedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill they offer" />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsWanted.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message:</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to swap skills..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!offeredSkill || !wantedSkill || !message.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}