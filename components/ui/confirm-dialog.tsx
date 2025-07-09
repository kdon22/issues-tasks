"use client";

import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle } from './modal';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="sm">
      <ModalHeader showCloseButton={false}>
        <div className="flex items-center gap-3">
          {variant === 'destructive' && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          )}
          <ModalTitle className="text-lg font-semibold">{title}</ModalTitle>
        </div>
      </ModalHeader>
      
      <ModalBody>
        <p className="text-sm text-muted-foreground">{description}</p>
      </ModalBody>
      
      <ModalFooter>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? '' : 'bg-black hover:bg-black/90'}
          >
            {confirmText}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
} 