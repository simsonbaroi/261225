import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Database as DatabaseIcon, Save, X, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategoryNames } from '@/lib/categories';
import type { MedicalItem } from '@shared/schema';

const Database = () => {
  const [items, setItems] = useState<MedicalItem[]>([]);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'outpatient' | 'inpatient'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MedicalItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isCarouselMode, setIsCarouselMode] = useState<boolean>(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    isOutpatient: true
  });
  
  const { toast } = useToast();

  // Get all categories from permanent configuration (not database)
  const allCategories = [
    ...getCategoryNames(true),  // Outpatient categories
    ...getCategoryNames(false)  // Inpatient categories  
  ].filter((category, index, arr) => arr.indexOf(category) === index);

  // Fetch medical items from API (database contains only price data)
  const { data: medicalItems = [] } = useQuery<MedicalItem[]>({
    queryKey: ['/api/medical-items'],
  });

  useEffect(() => {
    setItems(medicalItems);
  }, [medicalItems]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'outpatient' && item.isOutpatient) ||
                       (filterType === 'inpatient' && !item.isOutpatient);
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await fetch('/api/medical-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to add item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-items'] });
      toast({
        title: "Success",
        description: "Item added successfully"
      });
      resetForm();
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, itemData }: { id: number, itemData: any }) => {
      const response = await fetch(`/api/medical-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-items'] });
      toast({
        title: "Success",
        description: "Item updated successfully"
      });
      setEditingItem(null);
      resetForm();
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/medical-items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-items'] });
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      isOutpatient: true
    });
    setIsAdding(false);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const itemData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description || null,
      isOutpatient: formData.isOutpatient,
      currency: 'BDT'
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, itemData });
    } else {
      addItemMutation.mutate(itemData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const startEdit = (item: MedicalItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || '',
      isOutpatient: item.isOutpatient
    });
    setIsAdding(true);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-emerald-800">Medical Items Database</h1>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search medical items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="outpatient">Outpatient</SelectItem>
                  <SelectItem value="inpatient">Inpatient</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Items ({filteredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.category} • ৳{item.price} • {item.isOutpatient ? 'Outpatient' : 'Inpatient'}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Form Modal */}
        {isAdding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Price (৳) *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <Select 
                    value={formData.isOutpatient ? 'outpatient' : 'inpatient'} 
                    onValueChange={(value) => setFormData({...formData, isOutpatient: value === 'outpatient'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem ? 'Update' : 'Add'} Item
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Database;