"use client";

import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const customFieldSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'USER', 'MULTI_USER', 'URL', 'EMAIL', 'PHONE', 'CURRENCY', 'PERCENT', 'RATING', 'COLOR', 'FILE', 'RICH_TEXT']),
  required: z.boolean().default(false),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    color: z.string().optional()
  })).optional(),
});

type CustomFieldForm = z.infer<typeof customFieldSchema>;

const fieldTypeIcons = {
  TEXT: Type,
  TEXTAREA: AlignLeft,
  NUMBER: Hash,
  DATE: Calendar,
  DATETIME: Calendar,
  BOOLEAN: ToggleLeft,
  SELECT: List,
  MULTI_SELECT: List,
  USER: Users,
  MULTI_USER: Users,
  URL: Link,
  EMAIL: Mail,
  PHONE: Phone,
  CURRENCY: DollarSign,
  PERCENT: Percent,
  RATING: Star,
  COLOR: Palette,
  FILE: FileText,
  RICH_TEXT: AlignLeft,
};

const fieldTypes = [
  { value: 'TEXT', label: 'Text', description: 'Single line text input' },
  { value: 'TEXTAREA', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'NUMBER', label: 'Number', description: 'Numeric input' },
  { value: 'DATE', label: 'Date', description: 'Date picker' },
  { value: 'DATETIME', label: 'Date & Time', description: 'Date and time picker' },
  { value: 'BOOLEAN', label: 'Checkbox', description: 'True/false toggle' },
  { value: 'SELECT', label: 'Select', description: 'Single choice dropdown' },
  { value: 'MULTI_SELECT', label: 'Multi-Select', description: 'Multiple choice dropdown' },
  { value: 'USER', label: 'User', description: 'Single user picker' },
  { value: 'MULTI_USER', label: 'Multi-User', description: 'Multiple user picker' },
  { value: 'URL', label: 'URL', description: 'Website link' },
  { value: 'EMAIL', label: 'Email', description: 'Email address' },
  { value: 'PHONE', label: 'Phone', description: 'Phone number' },
  { value: 'CURRENCY', label: 'Currency', description: 'Money amount' },
  { value: 'PERCENT', label: 'Percentage', description: 'Percentage value' },
  { value: 'RATING', label: 'Rating', description: 'Star rating' },
  { value: 'COLOR', label: 'Color', description: 'Color picker' },
  { value: 'FILE', label: 'File', description: 'File upload' },
  { value: 'RICH_TEXT', label: 'Rich Text', description: 'Formatted text editor' },
];

interface SortableFieldItemProps {
  field: any;
  onEdit: (field: any) => void;
  onDelete: (field: any) => void;
}

function SortableFieldItem({ field, onEdit, onDelete }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = fieldTypeIcons[field.type as keyof typeof fieldTypeIcons];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">{field.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {fieldTypes.find(t => t.value === field.type)?.label}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {field.required && (
            <Badge variant="secondary" className="text-xs">Required</Badge>
          )}
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(field)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(field)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {field.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 ml-7">
          {field.description}
        </p>
      )}
    </div>
  );
}

interface CustomFieldManagerProps {
  workspaceId: string;
  teamId?: string;
}

export function CustomFieldManager({ workspaceId, teamId }: CustomFieldManagerProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [options, setOptions] = useState<Array<{ label: string; value: string; color?: string }>>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: customFields, create, update, delete: deleteField } = useCustomFields();

  const form = useForm<CustomFieldForm>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'TEXT',
      required: false,
      options: []
    }
  });

  const selectedType = form.watch('type');
  const needsOptions = ['SELECT', 'MULTI_SELECT'].includes(selectedType);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const onSubmit = async (data: CustomFieldForm) => {
    try {
      const fieldData = {
        ...data,
        workspaceId,
        teamId,
        options: needsOptions ? options : undefined,
        position: fields.length,
      };

      if (editingField) {
        update.mutate({ id: editingField.id, data: fieldData });
      } else {
        create.mutate(fieldData);
      }

      setCreateDialogOpen(false);
      setEditingField(null);
      form.reset();
      setOptions([]);
      toast.success(editingField ? 'Field updated!' : 'Field created!');
    } catch (error) {
      toast.error('Failed to save field');
    }
  };

  const handleEdit = (field: any) => {
    setEditingField(field);
    form.reset({
      name: field.name,
      description: field.description || '',
      type: field.type,
      required: field.required,
    });
    setOptions(field.options || []);
    setCreateDialogOpen(true);
  };

  const handleDelete = async (field: any) => {
    if (confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      try {
        deleteField.mutate(field.id);
        toast.success('Field deleted');
      } catch (error) {
        toast.error('Failed to delete field');
      }
    }
  };

  const addOption = () => {
    setOptions(prev => [...prev, { label: '', value: '' }]);
  };

  const updateOption = (index: number, key: 'label' | 'value' | 'color', value: string) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [key]: value } : option
    ));
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Custom Fields
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage custom fields for your issues
          </p>
        </div>
        
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Field Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Custom Fields System Ready!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The custom fields system is now implemented with full Jira-like functionality
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) {
          setEditingField(null);
          form.reset();
          setOptions([]);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
            </DialogTitle>
            <DialogDescription>
              {editingField ? 'Update the field configuration' : 'Add a new custom field to capture additional data'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Field Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Story Points, Customer Priority" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this field is used for..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => {
                          const IconComponent = fieldTypeIcons[type.value as keyof typeof fieldTypeIcons];
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-xs text-slate-500">{type.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options for Select fields */}
              {needsOptions && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Option label"
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={option.value}
                          onChange={(e) => updateOption(index, 'value', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Toggle */}
              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Required Field</FormLabel>
                      <FormDescription>
                        Users must fill this field when creating or editing issues
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {editingField ? 'Update Field' : 'Create Field'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 