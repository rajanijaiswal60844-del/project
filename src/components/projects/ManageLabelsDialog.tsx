
'use client';

import { useState, KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useProjects } from '@/context/ProjectsContext';
import { Badge } from '../ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManageLabelsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ManageLabelsDialog({ isOpen, setIsOpen }: ManageLabelsDialogProps) {
    const { labels, addLabel, deleteLabel } = useProjects();
    const [newLabel, setNewLabel] = useState('');
    const { toast } = useToast();

    const handleAddLabel = () => {
        if (newLabel.trim() === '') {
            toast({ variant: 'destructive', title: 'Label cannot be empty.' });
            return;
        }
        if (labels.some(l => l.name.toLowerCase() === newLabel.trim().toLowerCase())) {
             toast({ variant: 'destructive', title: 'Label already exists.' });
            return;
        }
        addLabel({ name: newLabel.trim() });
        setNewLabel('');
        toast({ title: `Label "${newLabel.trim()}" added.`});
    }

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddLabel();
        }
    }
    
    const handleDeleteLabel = (labelId: string, labelName: string) => {
        deleteLabel(labelId);
        toast({ variant: 'destructive', title: `Label "${labelName}" deleted.`});
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
          <DialogDescription>
            Add new labels or remove existing ones. Deleting a label will remove it from all associated projects.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="New label name..."
                />
                <Button onClick={handleAddLabel}><Plus className="mr-2 h-4 w-4" /> Add</Button>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Existing Labels</p>
                <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                        <Badge key={label.id} variant="secondary" className="font-normal text-base pl-3 pr-1 py-1">
                            {label.name}
                            <button onClick={() => handleDeleteLabel(label.id, label.name)} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {labels.length === 0 && <p className="text-sm text-muted-foreground">No labels found.</p>}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
