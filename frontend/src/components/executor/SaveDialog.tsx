import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import toast from 'react-hot-toast'
import { useState } from 'react'

interface SaveDialogProps {
  isOpen: boolean
  onClose: () => void
  strategyContent: string
}

interface FormValues {
  title: string
  description: string
}

export function SaveDialog({ isOpen, onClose, strategyContent }: SaveDialogProps) {
  const { data: session } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: ''
    }
  })


  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: FormValues) => {
    if (!session?.accessToken) {
      toast.error('You must be logged in to save strategies')
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('http://localhost:8001/strategy/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          ...data,
          code: strategyContent
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Server error: ${response.status}`)
      }

      toast.success('Strategy saved successfully')
      reset()
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save strategy')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Strategy</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="flex items-center">
              Title <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              placeholder="Enter strategy title"
              {...register("title", { 
                required: "Title is required" 
              })}
              className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="flex items-center">
              Description <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              placeholder="Enter strategy description"
              rows={4}
              {...register("description", { 
                required: "Description is required" 
              })}
              className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!isValid || isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}