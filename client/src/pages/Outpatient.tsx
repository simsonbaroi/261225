import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Plus, Minus, Calculator, Grid3X3, ChevronLeft, ChevronRight, X, AlertTriangle, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { useTakaFormat } from '../hooks/useCurrencyFormat';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import type { MedicalItem } from '../../../shared/schema';
import { calculateMedicineDosage, formatDosageForBill, MEDICINE_RULES } from '../../../shared/medicineCalculations';
import { getCategoryNames, getCategoryInterface } from '../lib/categories';

interface BillItem extends MedicalItem {
  billId: string; // Unique identifier for each bill entry
}

const Outpatient = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isCarouselMode, setIsCarouselMode] = useState<boolean>(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [selectedLabItems, setSelectedLabItems] = useState<MedicalItem[]>([]);
  const [dropdownSelectedItems, setDropdownSelectedItems] = useState<MedicalItem[]>([]);
  const [selectedXRayItems, setSelectedXRayItems] = useState<MedicalItem[]>([]);
  const [xRayDropdownSelectedItems, setXRayDropdownSelectedItems] = useState<MedicalItem[]>([]);
  const [selectedMedicineItems, setSelectedMedicineItems] = useState<MedicalItem[]>([]);
  const [medicineDropdownSelectedItems, setMedicineDropdownSelectedItems] = useState<MedicalItem[]>([]);
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [highlightedDropdownIndex, setHighlightedDropdownIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [dropdownFilterQuery, setDropdownFilterQuery] = useState<string>('');
  const [xRayDropdownValue, setXRayDropdownValue] = useState<string>('');
  const [xRayHighlightedDropdownIndex, setXRayHighlightedDropdownIndex] = useState<number>(-1);
  const [isXRayDropdownOpen, setIsXRayDropdownOpen] = useState<boolean>(false);
  const [xRayDropdownFilterQuery, setXRayDropdownFilterQuery] = useState<string>('');
  const [medicineDropdownValue, setMedicineDropdownValue] = useState<string>('');
  const [medicineHighlightedDropdownIndex, setMedicineHighlightedDropdownIndex] = useState<number>(-1);
  const [isMedicineDropdownOpen, setIsMedicineDropdownOpen] = useState<boolean>(false);
  const [medicineDropdownFilterQuery, setMedicineDropdownFilterQuery] = useState<string>('');
  const [duplicateDialog, setDuplicateDialog] = useState<{open: boolean, item: MedicalItem | null}>({open: false, item: null});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const xRayDropdownRef = useRef<HTMLDivElement>(null);
  const xRayDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const xRaySearchInputRef = useRef<HTMLInputElement>(null);
  const medicineDropdownRef = useRef<HTMLDivElement>(null);
  const medicineDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const medicineSearchInputRef = useRef<HTMLInputElement>(null);

  // Manual entry state for Physical Therapy and Limb and Brace
  const [manualServiceName, setManualServiceName] = useState('');
  const [manualServicePrice, setManualServicePrice] = useState('');
  const [previousEntries, setPreviousEntries] = useState<{name: string, price: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const manualNameInputRef = useRef<HTMLInputElement>(null);
  const manualPriceInputRef = useRef<HTMLInputElement>(null);

  // X-Ray film view selection state
  const [selectedXRayForViews, setSelectedXRayForViews] = useState<MedicalItem | null>(null);
  const [xRayViews, setXRayViews] = useState({
    AP: false,
    LAT: false,
    OBLIQUE: false,
    BOTH: false
  });
  const [isOffChargePortable, setIsOffChargePortable] = useState(false);
  const [showXRayViewSelection, setShowXRayViewSelection] = useState(false);

  // Medicine dosage selection state
  const [selectedMedicineForDosage, setSelectedMedicineForDosage] = useState<MedicalItem | null>(null);
  const [showMedicineDosageSelection, setShowMedicineDosageSelection] = useState(false);
  const [dosePrescribed, setDosePrescribed] = useState('');
  const [medType, setMedType] = useState('');
  const [doseFrequency, setDoseFrequency] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [tempSelectedMedicines, setTempSelectedMedicines] = useState<Array<MedicalItem & { tempId: string }>>([]);
  const doseInputRef = useRef<HTMLInputElement>(null);
  const { format } = useTakaFormat();
  const queryClient = useQueryClient();

  // Get outpatient medical items
  const { data: medicalItems = [] } = useQuery<MedicalItem[]>({
    queryKey: ['/api/medical-items', { isOutpatient: true }],
  });

  // Get permanent outpatient categories in correct order
  const categories = getCategoryNames(true); // Use permanent outpatient categories

  // Filter items by category
  const categoryItems = selectedCategory 
    ? medicalItems.filter((item: MedicalItem) => item.category === selectedCategory)
    : [];

  // For Laboratory: both search and dropdown use same database items but work independently
  const getSearchItems = () => {
    return categoryItems; // Use all items for search
  };

  const getDropdownItems = () => {
    return categoryItems; // Use all items for dropdown
  };

  const searchItems = getSearchItems();
  const dropdownItems = getDropdownItems();

  // Filter category items by search (only from search items)
  const filteredCategoryItems = categorySearchQuery
    ? searchItems.filter((item: MedicalItem) => 
        item.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
      )
    : searchItems;

  // Global search results
  const globalSearchResults = globalSearchQuery
    ? medicalItems.filter((item: MedicalItem) =>
        item.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(globalSearchQuery.toLowerCase())
      )
    : [];

  // Save bill mutation
  const saveBillMutation = useMutation({
    mutationFn: async (billData: any) => {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'outpatient',
          sessionId: 'browser-session',
          billData: JSON.stringify(billData),
          total: calculateTotal.toString(),
          currency: 'BDT',
        }),
      });
      if (!response.ok) throw new Error('Failed to save bill');
      return response.json();
    },
  });

  // Load saved bill and previous entries on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load saved bill
        const billResponse = await fetch('/api/bills?sessionId=browser-session&type=outpatient');
        if (billResponse.ok) {
          const bill = await billResponse.json();
          if (bill && bill.billData) {
            setBillItems(JSON.parse(bill.billData));
          }
        }

        // Load previous manual entries from localStorage
        const savedEntries = localStorage.getItem('outpatient-manual-entries');
        if (savedEntries) {
          setPreviousEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  // Auto-save bill when items change
  useEffect(() => {
    if (billItems.length > 0) {
      saveBillMutation.mutate(billItems);
    }
  }, [billItems]);

  const addToBill = (item: MedicalItem) => {
    const existingItem = billItems.find(billItem => billItem.id === item.id);
    
    if (existingItem) {
      // Show duplicate confirmation dialog
      setDuplicateDialog({ open: true, item });
    } else {
      setBillItems([...billItems, { ...item, billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
    }
  };

  // Handle duplicate dialog actions
  const handleDuplicateAction = (action: 'add' | 'skip' | 'remove') => {
    const item = duplicateDialog.item;
    if (!item) return;

    switch (action) {
      case 'add':
        // Add the item again (allow duplicate)
        setBillItems([...billItems, { ...item, billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
        break;
      case 'skip':
        // Do nothing, just close dialog
        break;
      case 'remove':
        // Remove existing item from bill
        setBillItems(billItems.filter(billItem => billItem.id !== item.id));
        break;
    }
    
    setDuplicateDialog({ open: false, item: null });
  };

  // Removed updateQuantity function - no longer needed without quantity controls

  const removeFromBill = (billId: string) => {
    setBillItems(billItems.filter(item => item.billId !== billId));
  };

  // Memoized total calculation for performance
  const calculateTotal = useMemo(() => {
    return billItems.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return total + price; // No quantity multiplier since we removed quantity controls
    }, 0);
  }, [billItems]);

  // Memoized bill items grouped by category for performance
  const getBillItemsByCategory = useMemo(() => {
    const grouped = billItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, BillItem[]>);

    return grouped;
  }, [billItems]);

  // Memoized category total calculation
  const calculateCategoryTotal = useCallback((items: BillItem[]) => {
    return items.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return total + price; // No quantity multiplier since we removed quantity controls
    }, 0);
  }, []);

  const clearBill = () => {
    setBillItems([]);
  };

  // Categories that should not have search functionality
  const categoriesWithoutSearch = ['Registration Fees', 'Dr. Fees', 'Medic Fee'];

  // Use categories directly since they're already in correct order from permanent config
  const orderedCategories = categories;

  // Carousel navigation functions
  const handleCategoryClick = (category: string) => {
    if (isCarouselMode && category === selectedCategory) {
      // If already in carousel mode and same category clicked, exit carousel
      setIsCarouselMode(false);
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
      setIsCarouselMode(true);
      setCurrentCategoryIndex(orderedCategories.indexOf(category));
      setCategorySearchQuery(''); // Reset search when switching categories
    }
  };

  const navigateCarousel = (direction: 'prev' | 'next') => {
    console.log('Navigate carousel:', direction, 'from index:', currentCategoryIndex);
    const newIndex = direction === 'prev' 
      ? (currentCategoryIndex - 1 + orderedCategories.length) % orderedCategories.length
      : (currentCategoryIndex + 1) % orderedCategories.length;
    
    console.log('New index:', newIndex, 'category:', orderedCategories[newIndex]);
    setCurrentCategoryIndex(newIndex);
    setSelectedCategory(orderedCategories[newIndex]);
    setCategorySearchQuery(''); // Reset search when switching categories
  };

  // Swipe gesture support for carousel navigation
  const swipeRef = useSwipeGesture({
    onSwipeLeft: () => {
      console.log('Swipe left detected, carousel mode:', isCarouselMode);
      if (isCarouselMode) {
        navigateCarousel('next');
      }
    },
    onSwipeRight: () => {
      console.log('Swipe right detected, carousel mode:', isCarouselMode);
      if (isCarouselMode) {
        navigateCarousel('prev');
      }
    },
    threshold: 50, // Reduced threshold for better sensitivity
    preventDefaultEvents: true
  });

  const exitCarousel = () => {
    setIsCarouselMode(false);
    setSelectedCategory('');
    setCategorySearchQuery('');
    setGlobalSearchQuery(''); // Clear global search when exiting carousel
    setSelectedLabItems([]); // Clear lab selections when exiting
    setDropdownSelectedItems([]); // Clear dropdown selections when exiting
    setDropdownValue(''); // Reset dropdown value
    setHighlightedDropdownIndex(-1); // Reset highlighted index
    setIsDropdownOpen(false); // Close dropdown
    setDropdownFilterQuery(''); // Reset filter query
    setSelectedXRayItems([]); // Clear X-Ray selections when exiting
    setXRayDropdownSelectedItems([]); // Clear X-Ray dropdown selections when exiting
    setXRayDropdownValue(''); // Reset X-Ray dropdown value
    setXRayHighlightedDropdownIndex(-1); // Reset X-Ray highlighted index
    setIsXRayDropdownOpen(false); // Close X-Ray dropdown
    setXRayDropdownFilterQuery(''); // Reset X-Ray filter query
    setSelectedMedicineItems([]); // Clear Medicine selections when exiting
    setMedicineDropdownSelectedItems([]); // Clear Medicine dropdown selections when exiting
    setMedicineDropdownValue(''); // Reset Medicine dropdown value
    setMedicineHighlightedDropdownIndex(-1); // Reset Medicine highlighted index
    setIsMedicineDropdownOpen(false); // Close Medicine dropdown
    setMedicineDropdownFilterQuery(''); // Reset Medicine filter query
    setManualServiceName(''); // Clear manual service name
    setManualServicePrice(''); // Clear manual service price
    setShowSuggestions(false); // Hide suggestions
    setHighlightedSuggestionIndex(-1); // Reset highlighted suggestion
    setSelectedXRayForViews(null); // Clear X-Ray view selection
    setXRayViews({ AP: false, LAT: false, OBLIQUE: false, BOTH: false }); // Reset X-Ray views
    setIsOffChargePortable(false); // Reset Off-Charge/Portable
    setShowXRayViewSelection(false); // Hide X-Ray view selection
  };

  // Handle dropdown selection
  const handleDropdownSelect = (value: string) => {
    const selectedItem = categoryItems.find(item => item.id.toString() === value);
    
    // Check if item is already selected in dropdown OR already in the bill
    const alreadyInDropdown = dropdownSelectedItems.find(item => item.id === selectedItem?.id);
    const alreadyInBill = billItems.find(billItem => billItem.id === selectedItem?.id);
    
    if (selectedItem && !alreadyInDropdown && !alreadyInBill) {
      setDropdownSelectedItems(prev => [...prev, selectedItem]);
      // Clear search selections when using dropdown
      setSelectedLabItems([]);
      setCategorySearchQuery('');
    }
    // If item is already selected, we just ignore the selection (no error message needed)
    
    setDropdownValue(''); // Reset dropdown after selection
    setHighlightedDropdownIndex(-1); // Reset highlighted index
    setDropdownFilterQuery(''); // Reset filter text for fresh start
    
    // Refocus the dropdown button to continue keyboard input
    setTimeout(() => {
      if (dropdownButtonRef.current) {
        dropdownButtonRef.current.focus();
      }
    }, 0);
    // Keep dropdown open for multiple selections
  };

  // Handle keyboard navigation for dropdown
  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    const orderedItems = getFilteredDropdownItems();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedDropdownIndex(prev => 
        prev < orderedItems.length - 1 ? prev + 1 : 0
      );
      if (!isDropdownOpen) setIsDropdownOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedDropdownIndex(prev => 
        prev > 0 ? prev - 1 : orderedItems.length - 1
      );
      if (!isDropdownOpen) setIsDropdownOpen(true);
    } else if (e.key === 'Enter' && highlightedDropdownIndex >= 0) {
      e.preventDefault();
      const selectedItem = orderedItems[highlightedDropdownIndex];
      if (selectedItem) {
        handleDropdownSelect(selectedItem.id.toString());
        // Dropdown stays open and focused for more selections
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedDropdownIndex(-1);
      setDropdownFilterQuery('');
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9\s]/)) {
      // Handle typing to filter dropdown items
      e.preventDefault();
      const newQuery = dropdownFilterQuery + e.key.toLowerCase();
      setDropdownFilterQuery(newQuery);
      setHighlightedDropdownIndex(0); // Highlight first filtered result
      if (!isDropdownOpen) setIsDropdownOpen(true);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setDropdownFilterQuery(prev => prev.slice(0, -1));
      setHighlightedDropdownIndex(0);
    }
  };

  // Get sorted lab suggestions with closest match first
  const getLabSuggestions = () => {
    if (!categorySearchQuery) return [];
    
    const query = categorySearchQuery.toLowerCase();
    const suggestions = filteredCategoryItems.filter(item => 
      item.name.toLowerCase().includes(query)
    );
    
    // Sort by relevance: exact matches first, then starts with, then contains
    return suggestions.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aName === query) return -1;
      if (bName === query) return 1;
      
      // Starts with query gets second priority
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      
      // Both start with or both contain - sort alphabetically
      return aName.localeCompare(bName);
    });
  };

  // Handle comma-separated lab item selection
  const handleLabSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const query = categorySearchQuery.trim();
      if (query) {
        // Get the top suggestion (closest match)
        const suggestions = getLabSuggestions();
        if (suggestions.length > 0) {
          const topMatch = suggestions[0];
          // Check if item is already selected in search OR already in the bill
          const alreadyInSearch = selectedLabItems.find(item => item.id === topMatch.id);
          const alreadyInBill = billItems.find(billItem => billItem.id === topMatch.id);
          
          if (!alreadyInSearch && !alreadyInBill) {
            setSelectedLabItems(prev => [...prev, topMatch]);
          }
          // If item is already selected or in bill, we ignore the selection
        }
        setCategorySearchQuery('');
        // Refocus search input for continuous typing
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 0);
      }
    }
  };

  // Remove lab item from selection
  const removeLabItem = (itemId: number) => {
    setSelectedLabItems(prev => prev.filter(item => item.id !== itemId));
    // Refocus search input after removing item
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  // Add all selected lab items to bill
  const addSelectedLabItemsToBill = () => {
    const newItems: MedicalItem[] = [];
    const duplicateItems: MedicalItem[] = [];
    
    selectedLabItems.forEach(item => {
      const existingItem = billItems.find(billItem => billItem.id === item.id);
      if (existingItem) {
        duplicateItems.push(item);
      } else {
        newItems.push(item);
      }
    });
    
    // Add new items immediately
    if (newItems.length > 0) {
      const billItemsToAdd = newItems.map(item => ({ 
        ...item, 
        billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
      }));
      setBillItems(prevBillItems => [...prevBillItems, ...billItemsToAdd]);
    }
    
    // Handle duplicates - for now, skip them and show a message
    if (duplicateItems.length > 0) {
      // Show duplicate dialog for the first duplicate item
      setDuplicateDialog({ open: true, item: duplicateItems[0] });
    }
    
    setSelectedLabItems([]);
    // Refocus search input after adding to bill
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  // Remove item from dropdown selection
  const removeDropdownItem = (itemId: number) => {
    setDropdownSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Add all dropdown selected items to bill
  const addDropdownSelectedItemsToBill = () => {
    const newItems: MedicalItem[] = [];
    const duplicateItems: MedicalItem[] = [];
    
    dropdownSelectedItems.forEach(item => {
      const existingItem = billItems.find(billItem => billItem.id === item.id);
      if (existingItem) {
        duplicateItems.push(item);
      } else {
        newItems.push(item);
      }
    });
    
    // Add new items immediately
    if (newItems.length > 0) {
      const billItemsToAdd = newItems.map(item => ({ 
        ...item, 
        billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
      }));
      setBillItems(prevBillItems => [...prevBillItems, ...billItemsToAdd]);
    }
    
    // Handle duplicates - for now, skip them and show a message
    if (duplicateItems.length > 0) {
      // Show duplicate dialog for the first duplicate item
      setDuplicateDialog({ open: true, item: duplicateItems[0] });
    }
    
    setDropdownSelectedItems([]);
    // Close dropdown when adding to bill
    setIsDropdownOpen(false);
    setHighlightedDropdownIndex(-1);
    setDropdownFilterQuery('');
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedDropdownIndex(-1);
        setDropdownFilterQuery(''); // Reset filter when clicking outside
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Ensure dropdown button stays focused for continuous keyboard input
  useEffect(() => {
    if (isDropdownOpen && dropdownButtonRef.current) {
      dropdownButtonRef.current.focus();
    }
  }, [dropdownFilterQuery, dropdownSelectedItems.length]);

  // Auto-focus search input when Laboratory category is selected
  useEffect(() => {
    if (selectedCategory === 'Laboratory' && isCarouselMode && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [selectedCategory, isCarouselMode]);

  // Handle click outside X-Ray dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (xRayDropdownRef.current && !xRayDropdownRef.current.contains(event.target as Node)) {
        setIsXRayDropdownOpen(false);
        setXRayHighlightedDropdownIndex(-1);
        setXRayDropdownFilterQuery(''); // Reset filter when clicking outside
      }
    };

    if (isXRayDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isXRayDropdownOpen]);

  // Handle click outside for Medicine dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(event.target as Node)) {
        setIsMedicineDropdownOpen(false);
        setMedicineHighlightedDropdownIndex(-1);
        setMedicineDropdownFilterQuery(''); // Reset filter when clicking outside
      }
    };

    if (isMedicineDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMedicineDropdownOpen]);

  // Ensure X-Ray dropdown button stays focused for continuous keyboard input
  useEffect(() => {
    if (isXRayDropdownOpen && xRayDropdownButtonRef.current) {
      xRayDropdownButtonRef.current.focus();
    }
  }, [xRayDropdownFilterQuery, xRayDropdownSelectedItems.length]);

  // Ensure Medicine dropdown button stays focused for continuous keyboard input
  useEffect(() => {
    if (isMedicineDropdownOpen && medicineDropdownButtonRef.current) {
      medicineDropdownButtonRef.current.focus();
    }
  }, [medicineDropdownFilterQuery, medicineDropdownSelectedItems.length]);

  // Auto-focus search input when X-Ray category is selected
  useEffect(() => {
    if (selectedCategory === 'X-Ray' && isCarouselMode && xRaySearchInputRef.current) {
      xRaySearchInputRef.current.focus();
    }
  }, [selectedCategory, isCarouselMode]);

  // Auto-focus search input when Medicine category is selected
  useEffect(() => {
    if (selectedCategory === 'Medicine' && isCarouselMode && medicineSearchInputRef.current) {
      medicineSearchInputRef.current.focus();
    }
  }, [selectedCategory, isCarouselMode]);

  // Auto-focus manual entry input when Physical Therapy or Limb and Brace category is selected
  useEffect(() => {
    if (['Physical Therapy', 'Limb and Brace'].includes(selectedCategory) && isCarouselMode && manualNameInputRef.current) {
      manualNameInputRef.current.focus();
    }
  }, [selectedCategory, isCarouselMode]);

  // Add global keyboard navigation for carousel mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when in carousel mode and not focused on input fields
      if (!isCarouselMode) return;
      
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           activeElement?.role === 'combobox' ||
                           activeElement?.getAttribute('contenteditable') === 'true';
      
      // Don't interfere if user is typing in an input field
      if (isInputFocused) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateCarousel('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateCarousel('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        exitCarousel();
      }
    };

    // Add event listener when carousel mode is active
    if (isCarouselMode) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCarouselMode, currentCategoryIndex, orderedCategories.length]);

  // Get dropdown items sorted by relevance when user is typing in search
  const getOrderedDropdownItems = () => {
    if (!categorySearchQuery.trim()) return categoryItems;
    
    const query = categorySearchQuery.toLowerCase();
    
    // Sort items by relevance to the search query
    return [...categoryItems].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIncludes = aName.includes(query);
      const bIncludes = bName.includes(query);
      
      // Items matching the search query come first
      if (aIncludes && !bIncludes) return -1;
      if (bIncludes && !aIncludes) return 1;
      
      // Among matching items, sort by relevance
      if (aIncludes && bIncludes) {
        // Exact match gets highest priority
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        // Starts with query gets second priority
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      }
      
      // Default alphabetical sort
      return aName.localeCompare(bName);
    });
  };

  // Get dropdown items filtered by direct typing in dropdown
  const getFilteredDropdownItems = () => {
    if (!dropdownFilterQuery.trim()) return getOrderedDropdownItems();
    
    const query = dropdownFilterQuery.toLowerCase();
    
    // Filter and sort by relevance
    return categoryItems
      .filter(item => item.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        // Starts with gets second priority
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        
        // Contains gets third priority - already filtered above
        return aName.localeCompare(bName);
      });
  };

  // X-Ray specific functions (same as Laboratory)
  
  // Get sorted X-Ray suggestions with closest match first
  const getXRaySuggestions = () => {
    if (!categorySearchQuery) return [];
    
    const query = categorySearchQuery.toLowerCase();
    const suggestions = filteredCategoryItems.filter(item => 
      item.name.toLowerCase().includes(query)
    );
    
    // Sort by relevance: exact matches first, then starts with, then contains
    return suggestions.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aName === query) return -1;
      if (bName === query) return 1;
      
      // Starts with query gets second priority
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      
      // Both start with or both contain - sort alphabetically
      return aName.localeCompare(bName);
    });
  };

  // Handle medicine item selection (redirect to dosage selection)
  const handleMedicineItemSelect = (item: MedicalItem) => {
    console.log('Medicine item selected:', item.name, 'Category:', item.category);
    console.log('Setting selectedMedicineForDosage to:', item);
    console.log('Setting showMedicineDosageSelection to: true');
    
    setSelectedMedicineForDosage(item);
    setShowMedicineDosageSelection(true);
    
    // Reset dosage fields when selecting new medicine
    setDosePrescribed('');
    setMedType('');
    setDoseFrequency('');
    setTotalDays('');
    
    // Auto-focus the dose input after a short delay
    setTimeout(() => {
      if (doseInputRef.current) {
        doseInputRef.current.focus();
      }
    }, 100);
  };

  // Handle comma-separated X-Ray item selection
  const handleXRaySearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const query = categorySearchQuery.trim();
      if (query) {
        // Get the top suggestion (closest match)
        const suggestions = getXRaySuggestions();
        if (suggestions.length > 0) {
          const topMatch = suggestions[0];
          // Check if item is already in the bill
          const alreadyInBill = billItems.find(billItem => billItem.id === topMatch.id);
          
          if (!alreadyInBill) {
            handleXRayItemSelect(topMatch);
          }
          // If item is already selected or in bill, we ignore the selection
        }
        setCategorySearchQuery('');
        // Refocus search input for continuous typing
        setTimeout(() => {
          if (xRaySearchInputRef.current) {
            xRaySearchInputRef.current.focus();
          }
        }, 0);
      }
    }
  };

  // Remove X-Ray item from selection
  const removeXRayItem = (itemId: number) => {
    setSelectedXRayItems(prev => prev.filter(item => item.id !== itemId));
    // Refocus search input after removing item
    setTimeout(() => {
      if (xRaySearchInputRef.current) {
        xRaySearchInputRef.current.focus();
      }
    }, 0);
  };

  // This function is no longer used as X-Ray items go through view selection first
  const addSelectedXRayItemsToBill = () => {
    // X-Ray items now use the view selection system
    // This function is kept for backward compatibility but not used
  };

  // Handle X-Ray dropdown selection
  const handleXRayDropdownSelect = (value: string) => {
    const selectedItem = categoryItems.find(item => item.id.toString() === value);
    
    // Check if item is already selected in dropdown OR already in the bill
    const alreadyInDropdown = xRayDropdownSelectedItems.find(item => item.id === selectedItem?.id);
    const alreadyInBill = billItems.find(billItem => billItem.id === selectedItem?.id);
    
    if (selectedItem && !alreadyInBill) {
      handleXRayItemSelect(selectedItem);
      // Clear search selections when using dropdown
      setSelectedXRayItems([]);
      setCategorySearchQuery('');
    }
    // If item is already selected, we just ignore the selection (no error message needed)
    
    setXRayDropdownValue(''); // Reset dropdown after selection
    setXRayHighlightedDropdownIndex(-1); // Reset highlighted index
    setXRayDropdownFilterQuery(''); // Reset filter text for fresh start
    
    // Refocus the dropdown button to continue keyboard input
    setTimeout(() => {
      if (xRayDropdownButtonRef.current) {
        xRayDropdownButtonRef.current.focus();
      }
    }, 0);
    // Keep dropdown open for multiple selections
  };

  // Handle keyboard navigation for X-Ray dropdown
  const handleXRayDropdownKeyDown = (e: React.KeyboardEvent) => {
    const orderedItems = getXRayFilteredDropdownItems();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setXRayHighlightedDropdownIndex(prev => 
        prev < orderedItems.length - 1 ? prev + 1 : 0
      );
      if (!isXRayDropdownOpen) setIsXRayDropdownOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setXRayHighlightedDropdownIndex(prev => 
        prev > 0 ? prev - 1 : orderedItems.length - 1
      );
      if (!isXRayDropdownOpen) setIsXRayDropdownOpen(true);
    } else if (e.key === 'Enter' && xRayHighlightedDropdownIndex >= 0) {
      e.preventDefault();
      const selectedItem = orderedItems[xRayHighlightedDropdownIndex];
      if (selectedItem) {
        handleXRayDropdownSelect(selectedItem.id.toString());
        // Dropdown stays open and focused for more selections
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsXRayDropdownOpen(false);
      setXRayHighlightedDropdownIndex(-1);
      setXRayDropdownFilterQuery('');
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9\s]/)) {
      // Handle typing to filter dropdown items
      e.preventDefault();
      const newQuery = xRayDropdownFilterQuery + e.key.toLowerCase();
      setXRayDropdownFilterQuery(newQuery);
      setXRayHighlightedDropdownIndex(0); // Highlight first filtered result
      if (!isXRayDropdownOpen) setIsXRayDropdownOpen(true);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setXRayDropdownFilterQuery(prev => prev.slice(0, -1));
      setXRayHighlightedDropdownIndex(0);
    }
  };

  // Remove item from X-Ray dropdown selection
  const removeXRayDropdownItem = (itemId: number) => {
    setXRayDropdownSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Add all X-Ray dropdown selected items to bill
  const addXRayDropdownSelectedItemsToBill = () => {
    const newItems: MedicalItem[] = [];
    const duplicateItems: MedicalItem[] = [];
    
    xRayDropdownSelectedItems.forEach(item => {
      const existingItem = billItems.find(billItem => billItem.id === item.id);
      if (existingItem) {
        duplicateItems.push(item);
      } else {
        newItems.push(item);
      }
    });
    
    // Add new items immediately
    if (newItems.length > 0) {
      const billItemsToAdd = newItems.map(item => ({ 
        ...item, 
        billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
      }));
      setBillItems(prevBillItems => [...prevBillItems, ...billItemsToAdd]);
    }
    
    // Handle duplicates - for now, skip them and show a message
    if (duplicateItems.length > 0) {
      // Show duplicate dialog for the first duplicate item
      setDuplicateDialog({ open: true, item: duplicateItems[0] });
    }
    
    setXRayDropdownSelectedItems([]);
    // Close dropdown when adding to bill
    setIsXRayDropdownOpen(false);
    setXRayHighlightedDropdownIndex(-1);
    setXRayDropdownFilterQuery('');
  };

  // Get X-Ray dropdown items sorted by relevance when user is typing in search
  const getXRayOrderedDropdownItems = () => {
    if (!categorySearchQuery.trim()) return categoryItems;
    
    const query = categorySearchQuery.toLowerCase();
    
    // Sort items by relevance to the search query
    return [...categoryItems].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIncludes = aName.includes(query);
      const bIncludes = bName.includes(query);
      
      // Items matching the search query come first
      if (aIncludes && !bIncludes) return -1;
      if (bIncludes && !aIncludes) return 1;
      
      // Among matching items, sort by relevance
      if (aIncludes && bIncludes) {
        // Exact match gets highest priority
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        // Starts with query gets second priority
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      }
      
      // Default alphabetical sort
      return aName.localeCompare(bName);
    });
  };

  // Get X-Ray dropdown items filtered by direct typing in dropdown
  const getXRayFilteredDropdownItems = () => {
    if (!xRayDropdownFilterQuery.trim()) return getXRayOrderedDropdownItems();
    
    const query = xRayDropdownFilterQuery.toLowerCase();
    
    // Filter and sort by relevance
    return categoryItems
      .filter(item => item.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        // Starts with gets second priority
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        
        // Contains gets third priority - already filtered above
        return aName.localeCompare(bName);
      });
  };

  // Medicine tag selection handlers - redirect to dosage selection
  const handleMedicineTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const query = categorySearchQuery.trim();
      if (query) {
        const matchingItems = categoryItems.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (matchingItems.length > 0) {
          const itemToAdd = matchingItems[0];
          console.log('Medicine search selected:', itemToAdd.name);
          handleMedicineItemSelect(itemToAdd);
          setCategorySearchQuery('');
        }
      }
    }
  };

  const removeMedicineTagItem = (itemId: number) => {
    setSelectedMedicineItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addMedicineTagItemsToBill = () => {
    const newItems: MedicalItem[] = [];
    const duplicateItems: MedicalItem[] = [];
    
    selectedMedicineItems.forEach(item => {
      const existingItem = billItems.find(billItem => billItem.id === item.id);
      if (existingItem) {
        duplicateItems.push(item);
      } else {
        newItems.push(item);
      }
    });
    
    if (newItems.length > 0) {
      const billItemsToAdd = newItems.map(item => ({ 
        ...item, 
        billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
      }));
      setBillItems(prevBillItems => [...prevBillItems, ...billItemsToAdd]);
    }
    
    if (duplicateItems.length > 0) {
      setDuplicateDialog({ open: true, item: duplicateItems[0] });
    }
    
    setSelectedMedicineItems([]);
    setCategorySearchQuery('');
    
    setTimeout(() => {
      if (medicineSearchInputRef.current) {
        medicineSearchInputRef.current.focus();
      }
    }, 0);
  };

  // Medicine dropdown selection handlers - redirect to dosage selection
  const handleMedicineDropdownSelect = (value: string) => {
    const selectedItem = categoryItems.find(item => item.id.toString() === value);
    
    const alreadyInBill = billItems.find(billItem => billItem.id === selectedItem?.id);
    
    if (selectedItem && !alreadyInBill) {
      console.log('Medicine dropdown selected:', selectedItem.name);
      handleMedicineItemSelect(selectedItem);
      // Clear search selections when using dropdown
      setSelectedMedicineItems([]);
      setCategorySearchQuery('');
    }
    
    setMedicineDropdownValue('');
    setMedicineHighlightedDropdownIndex(-1);
    setMedicineDropdownFilterQuery('');
    
    setTimeout(() => {
      if (medicineDropdownButtonRef.current) {
        medicineDropdownButtonRef.current.focus();
      }
    }, 0);
  };

  const handleMedicineDropdownKeyDown = (e: React.KeyboardEvent) => {
    const orderedItems = getMedicineFilteredDropdownItems();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMedicineHighlightedDropdownIndex(prev => 
        prev < orderedItems.length - 1 ? prev + 1 : 0
      );
      if (!isMedicineDropdownOpen) setIsMedicineDropdownOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMedicineHighlightedDropdownIndex(prev => 
        prev > 0 ? prev - 1 : orderedItems.length - 1
      );
      if (!isMedicineDropdownOpen) setIsMedicineDropdownOpen(true);
    } else if (e.key === 'Enter' && medicineHighlightedDropdownIndex >= 0) {
      e.preventDefault();
      const selectedItem = orderedItems[medicineHighlightedDropdownIndex];
      if (selectedItem) {
        handleMedicineDropdownSelect(selectedItem.id.toString());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsMedicineDropdownOpen(false);
      setMedicineHighlightedDropdownIndex(-1);
      setMedicineDropdownFilterQuery('');
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9\s]/)) {
      e.preventDefault();
      const newQuery = medicineDropdownFilterQuery + e.key.toLowerCase();
      setMedicineDropdownFilterQuery(newQuery);
      setMedicineHighlightedDropdownIndex(0);
      if (!isMedicineDropdownOpen) setIsMedicineDropdownOpen(true);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setMedicineDropdownFilterQuery(prev => prev.slice(0, -1));
      setMedicineHighlightedDropdownIndex(0);
    }
  };

  const removeMedicineDropdownItem = (itemId: number) => {
    setMedicineDropdownSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addMedicineDropdownSelectedItemsToBill = () => {
    const newItems: MedicalItem[] = [];
    const duplicateItems: MedicalItem[] = [];
    
    medicineDropdownSelectedItems.forEach(item => {
      const existingItem = billItems.find(billItem => billItem.id === item.id);
      if (existingItem) {
        duplicateItems.push(item);
      } else {
        newItems.push(item);
      }
    });
    
    if (newItems.length > 0) {
      const billItemsToAdd = newItems.map(item => ({ 
        ...item, 
        billId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
      }));
      setBillItems(prevBillItems => [...prevBillItems, ...billItemsToAdd]);
    }
    
    if (duplicateItems.length > 0) {
      setDuplicateDialog({ open: true, item: duplicateItems[0] });
    }
    
    setMedicineDropdownSelectedItems([]);
    setIsMedicineDropdownOpen(false);
    setMedicineHighlightedDropdownIndex(-1);
    setMedicineDropdownFilterQuery('');
  };

  // Get Medicine dropdown items ordered by relevance
  const getMedicineOrderedDropdownItems = () => {
    if (!categorySearchQuery.trim()) return categoryItems;
    
    const query = categorySearchQuery.toLowerCase();
    
    return [...categoryItems].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIncludes = aName.includes(query);
      const bIncludes = bName.includes(query);
      
      if (aIncludes && !bIncludes) return -1;
      if (bIncludes && !aIncludes) return 1;
      
      if (aIncludes && bIncludes) {
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      }
      
      return aName.localeCompare(bName);
    });
  };

  // Get Medicine dropdown items filtered by direct typing
  const getMedicineFilteredDropdownItems = () => {
    if (!medicineDropdownFilterQuery.trim()) return getMedicineOrderedDropdownItems();
    
    const query = medicineDropdownFilterQuery.toLowerCase();
    
    return categoryItems
      .filter(item => item.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        
        return aName.localeCompare(bName);
      });
  };

  // Manual entry handlers for Physical Therapy and Limb and Brace
  const getSuggestions = () => {
    if (!manualServiceName.trim()) return [];
    
    const query = manualServiceName.toLowerCase();
    return previousEntries
      .filter(entry => entry.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === query) return -1;
        if (bName === query) return 1;
        
        // Starts with gets second priority
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
        
        // Contains gets third priority
        return aName.localeCompare(bName);
      })
      .slice(0, 5); // Limit to 5 suggestions
  };

  const handleManualServiceNameChange = (value: string) => {
    setManualServiceName(value);
    setShowSuggestions(value.trim().length > 0);
    setHighlightedSuggestionIndex(-1);
  };

  const handleManualServiceNameKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = getSuggestions();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedSuggestionIndex >= 0) {
      e.preventDefault();
      const selectedSuggestion = suggestions[highlightedSuggestionIndex];
      setManualServiceName(selectedSuggestion.name);
      setManualServicePrice(selectedSuggestion.price);
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
      // Focus price input for quick editing
      setTimeout(() => {
        if (manualPriceInputRef.current) {
          manualPriceInputRef.current.focus();
          manualPriceInputRef.current.select();
        }
      }, 0);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    } else if (e.key === 'Tab' && highlightedSuggestionIndex >= 0) {
      e.preventDefault();
      const selectedSuggestion = suggestions[highlightedSuggestionIndex];
      setManualServiceName(selectedSuggestion.name);
      setManualServicePrice(selectedSuggestion.price);
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  const selectSuggestion = (suggestion: {name: string, price: string}) => {
    setManualServiceName(suggestion.name);
    setManualServicePrice(suggestion.price);
    setShowSuggestions(false);
    setHighlightedSuggestionIndex(-1);
    // Focus price input for quick editing
    setTimeout(() => {
      if (manualPriceInputRef.current) {
        manualPriceInputRef.current.focus();
        manualPriceInputRef.current.select();
      }
    }, 0);
  };

  const addManualService = () => {
    if (!manualServiceName.trim() || !manualServicePrice.trim()) return;
    
    const priceValue = parseFloat(manualServicePrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price');
      return;
    }

    // Create a new manual service item
    const manualItem = {
      id: Date.now(), // Use timestamp as unique ID
      category: selectedCategory,
      name: manualServiceName.trim(),
      price: manualServicePrice,
      currency: 'BDT',
      description: `Manual entry for ${selectedCategory}`,
      isOutpatient: true,
      createdAt: new Date(),
      billId: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to bill
    setBillItems(prev => [...prev, manualItem]);

    // Save to previous entries (avoid duplicates)
    const newEntry = { name: manualServiceName.trim(), price: manualServicePrice };
    setPreviousEntries(prev => {
      const exists = prev.some(entry => 
        entry.name.toLowerCase() === newEntry.name.toLowerCase() && 
        entry.price === newEntry.price
      );
      
      if (exists) return prev;
      
      const updatedEntries = [newEntry, ...prev].slice(0, 50); // Keep only latest 50 entries
      
      // Save to localStorage
      localStorage.setItem('outpatient-manual-entries', JSON.stringify(updatedEntries));
      
      return updatedEntries;
    });

    // Clear form
    setManualServiceName('');
    setManualServicePrice('');
    setShowSuggestions(false);
    setHighlightedSuggestionIndex(-1);

    // Focus back to name input for next entry
    setTimeout(() => {
      if (manualNameInputRef.current) {
        manualNameInputRef.current.focus();
      }
    }, 0);
  };

  const handleManualPriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualService();
    }
  };

  // X-Ray view selection handlers
  const handleXRayItemSelect = (item: any) => {
    // Prevent selection if another X-Ray is already selected and views are not complete
    if (selectedXRayForViews && selectedXRayForViews.id !== item.id && !isViewSelectionComplete()) {
      alert('Please complete film view selection for the previous X-Ray before selecting another.');
      return;
    }

    setSelectedXRayForViews(item);
    setShowXRayViewSelection(true);
    // Reset views when selecting new X-Ray
    setXRayViews({ AP: false, LAT: false, OBLIQUE: false, BOTH: false });
    setIsOffChargePortable(false);
  };

  const handleXRayViewChange = (view: string) => {
    if (view === 'BOTH') {
      if (xRayViews.BOTH) {
        // If BOTH is already selected, unselect it
        setXRayViews(prev => ({ ...prev, BOTH: false }));
      } else {
        // If BOTH is being selected, clear AP, LAT, OBLIQUE and select BOTH
        setXRayViews({ AP: false, LAT: false, OBLIQUE: false, BOTH: true });
      }
    } else {
      // For AP, LAT, OBLIQUE
      setXRayViews(prev => {
        const newViews = { ...prev, [view]: !prev[view as keyof typeof prev] };
        // If any of AP, LAT, OBLIQUE is selected, unselect BOTH
        if (newViews.AP || newViews.LAT || newViews.OBLIQUE) {
          newViews.BOTH = false;
        }
        return newViews;
      });
    }
    
    // Reset Off-Charge/Portable when view selection changes
    setIsOffChargePortable(false);
  };

  const isViewSelectionComplete = () => {
    return xRayViews.AP || xRayViews.LAT || xRayViews.OBLIQUE || xRayViews.BOTH;
  };

  const getSelectedViewCount = () => {
    let count = 0;
    if (xRayViews.AP) count++;
    if (xRayViews.LAT) count++;
    if (xRayViews.OBLIQUE) count++;
    if (xRayViews.BOTH) count += 2; // BOTH counts as 2 views
    return count;
  };

  const isOffChargePortableAllowed = () => {
    // Off-Charge/Portable button only available when at least 1 film is selected
    return getSelectedViewCount() >= 1;
  };

  const addXRayToBill = () => {
    if (!selectedXRayForViews || !isViewSelectionComplete()) return;

    const selectedViews = [];
    if (xRayViews.AP) selectedViews.push('AP');
    if (xRayViews.LAT) selectedViews.push('LAT');
    if (xRayViews.OBLIQUE) selectedViews.push('OBLIQUE');
    if (xRayViews.BOTH) selectedViews.push('AP and LAT');

    const viewsText = selectedViews.join(' + ');
    const newXRayName = `${selectedXRayForViews.name} (${viewsText})`;
    
    // Check if this exact X-ray + film combination already exists in bill
    const existingXRayWithSameFilm = billItems.find(billItem => 
      billItem.name === newXRayName
    );
    
    if (existingXRayWithSameFilm) {
      // Show duplicate confirmation dialog for same X-ray + film combination
      setDuplicateDialog({ 
        open: true, 
        item: { 
          ...selectedXRayForViews, 
          name: newXRayName 
        } 
      });
      return;
    }

    const basePrice = parseFloat(String(selectedXRayForViews.price));
    
    // Create main X-Ray item with views
    const xRayItem = {
      ...selectedXRayForViews,
      name: newXRayName,
      billId: `xray-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const itemsToAdd = [xRayItem];

    // Add Off-Charge/Portable fee if selected
    if (isOffChargePortable) {
      const offChargeItem = {
        id: Date.now() + 1,
        category: 'X-Ray',
        name: `${selectedXRayForViews.name} - Off-Charge/Portable Fee`,
        price: Math.round(basePrice * 0.5).toString(), // 50% additional fee
        currency: 'BDT',
        description: `Off-Charge/Portable fee for ${selectedXRayForViews.name}`,
        isOutpatient: true,
        createdAt: new Date(),
        billId: `xray-portable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      itemsToAdd.push(offChargeItem);
    }

    // Add items to bill
    setBillItems(prev => [...prev, ...itemsToAdd]);

    // Reset X-Ray view selection
    setSelectedXRayForViews(null);
    setXRayViews({ AP: false, LAT: false, OBLIQUE: false, BOTH: false });
    setIsOffChargePortable(false);
    setShowXRayViewSelection(false);

    // Clear search selections
    setSelectedXRayItems([]);
    setXRayDropdownSelectedItems([]);
    setXRayDropdownValue('');
    setXRayHighlightedDropdownIndex(-1);
    setIsXRayDropdownOpen(false);
    setXRayDropdownFilterQuery('');
  };

  const cancelXRayViewSelection = () => {
    setSelectedXRayForViews(null);
    setXRayViews({ AP: false, LAT: false, OBLIQUE: false, BOTH: false });
    setIsOffChargePortable(false);
    setShowXRayViewSelection(false);
  };

  // Medicine dosage configuration for outpatient
  const medTypeOptions = Object.keys(MEDICINE_RULES);

  const doseFrequencyOptions = [
    { value: 'QD', label: 'QD (Once daily)' },
    { value: 'BID', label: 'BID (Twice daily)' },
    { value: 'TID', label: 'TID (Three times daily)' },
    { value: 'QID', label: 'QID (Four times daily)' },
    { value: 'QOD', label: 'QOD (Every other day)' },
    { value: 'QWEEK', label: 'QWEEK (Weekly)' }
  ];

  const isDosageSelectionComplete = () => {
    return dosePrescribed.trim() && medType && doseFrequency && totalDays.trim() && parseInt(totalDays) > 0;
  };

  const calculateOutpatientMedicineDosage = () => {
    if (!selectedMedicineForDosage || !isDosageSelectionComplete()) return { totalQuantity: 0, totalPrice: 0, calculationDetails: '', quantityUnit: '', pricePerUnit: 0, isPartialAllowed: false };

    try {
      const result = calculateMedicineDosage({
        dosePrescribed,
        medType,
        doseFrequency,
        totalDays: parseInt(totalDays),
        basePrice: parseFloat(String(selectedMedicineForDosage.price)),
        isInpatient: false, // Outpatient logic
        isDischargeMedicine: false
      });

      return result; // Return the complete result object
    } catch (error) {
      console.error('Medicine calculation error:', error);
      return { totalQuantity: 0, totalPrice: 0, calculationDetails: 'Calculation error', quantityUnit: '', pricePerUnit: 0, isPartialAllowed: false };
    }
  };

  const addMedicineToTempList = () => {
    if (!selectedMedicineForDosage || !isDosageSelectionComplete()) return;

    const calculationResult = calculateOutpatientMedicineDosage();
    
    if (calculationResult.totalQuantity === 0) {
      console.error('Failed to calculate medicine dosage');
      return;
    }

    // Use the shared formatting function
    const formattedName = formatDosageForBill(
      selectedMedicineForDosage.name,
      dosePrescribed,
      medType,
      doseFrequency,
      parseInt(totalDays),
      calculationResult
    );

    const medicineItem = {
      ...selectedMedicineForDosage,
      name: formattedName,
      price: calculationResult.totalPrice.toString(),
      tempId: `temp-medicine-${selectedMedicineForDosage.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dosageInfo: {
        dosePrescribed,
        medType,
        doseFrequency,
        totalDays,
        calculationResult
      }
    };

    setTempSelectedMedicines(prev => [...prev, medicineItem]);
    
    // Reset dosage selection to allow adding another medicine
    cancelMedicineDosageSelection();
  };

  const addAllTempMedicinesToBill = () => {
    if (tempSelectedMedicines.length === 0) return;

    const billItemsToAdd = tempSelectedMedicines.map(medicine => ({
      ...medicine,
      billId: `medicine-${medicine.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    setBillItems(prevBillItems => [...prevBillItems, ...billItemsToAdd]);
    setTempSelectedMedicines([]);
  };

  const removeTempMedicine = (tempId: string) => {
    setTempSelectedMedicines(prev => prev.filter(medicine => medicine.tempId !== tempId));
  };

  const editTempMedicine = (medicine: any) => {
    // Pre-fill the dosage calculator with existing values
    if (medicine.dosageInfo) {
      setSelectedMedicineForDosage(medicine);
      setDosePrescribed(medicine.dosageInfo.dosePrescribed);
      setMedType(medicine.dosageInfo.medType);
      setDoseFrequency(medicine.dosageInfo.doseFrequency);
      setTotalDays(medicine.dosageInfo.totalDays);
      setShowMedicineDosageSelection(true);
      
      // Remove the medicine from temp list since it will be re-added after editing
      removeTempMedicine(medicine.tempId);
      
      // Focus on dose input for immediate editing
      setTimeout(() => {
        if (doseInputRef.current) {
          doseInputRef.current.focus();
        }
      }, 100);
    }
  };

  const addMedicineToBill = () => {
    if (!selectedMedicineForDosage || !isDosageSelectionComplete()) return;

    const calculationResult = calculateOutpatientMedicineDosage();
    
    if (calculationResult.totalQuantity === 0) {
      console.error('Failed to calculate medicine dosage');
      return;
    }

    // Use the shared formatting function
    const formattedName = formatDosageForBill(
      selectedMedicineForDosage.name,
      dosePrescribed,
      medType,
      doseFrequency,
      parseInt(totalDays),
      calculationResult
    );
    
    // Create medicine item with dosage information
    const medicineItem = {
      ...selectedMedicineForDosage,
      name: formattedName,
      price: calculationResult.totalPrice.toString(),
      billId: `medicine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to bill
    setBillItems(prev => [...prev, medicineItem]);

    // Reset medicine dosage selection
    setSelectedMedicineForDosage(null);
    setShowMedicineDosageSelection(false);
    setDosePrescribed('');
    setMedType('');
    setDoseFrequency('');
    setTotalDays('');

    // Clear search selections
    setSelectedMedicineItems([]);
    setMedicineDropdownSelectedItems([]);
    setMedicineDropdownValue('');
    setMedicineHighlightedDropdownIndex(-1);
    setIsMedicineDropdownOpen(false);
    setMedicineDropdownFilterQuery('');
  };

  const cancelMedicineDosageSelection = () => {
    setSelectedMedicineForDosage(null);
    setShowMedicineDosageSelection(false);
    setDosePrescribed('');
    setMedType('');
    setDoseFrequency('');
    setTotalDays('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Outpatient Calculator</h1>
          <p className="text-muted-foreground">Calculate bills for outpatient services and procedures</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Categories and Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Global Search - Hidden in carousel mode */}
            {!isCarouselMode && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-medical-primary">
                    <Search className="mr-2 h-5 w-5" />
                    Search All Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search for medical items..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  {globalSearchResults.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                      {globalSearchResults.map((item: MedicalItem) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.category}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-medical-primary">
                              {format(item.price)}
                            </span>
                            <Button size="sm" onClick={() => addToBill(item)} variant="medical">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Category Buttons */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-medical-primary">
                  <span className="flex items-center">
                    <Grid3X3 className="mr-2 h-5 w-5" />
                    Categories
                  </span>
                  {isCarouselMode && (
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        Use ← → keys to navigate
                      </div>
                      <Button 
                        size="sm" 
                        variant="medical-ghost" 
                        onClick={exitCarousel}
                        className="h-8 w-8 p-0"
                        title="Exit carousel (Esc key)"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isCarouselMode ? (
                  // Normal grid mode
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {orderedCategories.map((category) => {
                      const itemCount = medicalItems.filter((item: MedicalItem) => item.category === category).length;
                      return (
                        <Button
                          key={category}
                          variant="medical-outline"
                          className="h-auto p-2 sm:p-3 text-left justify-start min-h-[60px]"
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className="w-full">
                            <div className="font-semibold text-xs sm:text-sm truncate leading-tight">{category}</div>
                            <div className="text-xs opacity-75 mt-1">{itemCount} items</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  // Carousel mode with preview buttons - mobile-optimized layout
                  <div 
                    ref={swipeRef}
                    className="w-full px-2 sm:px-0 relative select-none cursor-grab active:cursor-grabbing"
                    style={{ 
                      touchAction: 'pan-y',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      minHeight: '80px'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 max-w-full overflow-hidden">
                      {/* Previous preview button - hidden on very small screens */}
                      <Button
                        variant="medical-ghost"
                        className="h-auto p-1 sm:p-1.5 text-left flex-shrink-0 opacity-60 hover:opacity-80 w-12 sm:w-16 justify-start hidden xs:flex"
                        onClick={() => navigateCarousel('prev')}
                      >
                        <div className="w-full overflow-hidden">
                          <div className="text-xs truncate text-left leading-tight">
                            {orderedCategories[(currentCategoryIndex - 1 + orderedCategories.length) % orderedCategories.length]}
                          </div>
                        </div>
                      </Button>

                      {/* Previous arrow */}
                      <Button
                        variant="medical-outline"
                        size="sm"
                        onClick={() => navigateCarousel('prev')}
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                        title="Previous category (← key)"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      {/* Current selected category - centered and responsive */}
                      <Button
                        variant="outline"
                        className="h-auto p-2 sm:p-3 text-center flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] border-medical-primary/20 text-medical-primary hover:bg-medical-primary/10"
                        onClick={() => handleCategoryClick(selectedCategory)}
                      >
                        <div className="w-full min-w-0">
                          <div className="font-semibold text-xs sm:text-sm truncate leading-tight">{selectedCategory}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {medicalItems.filter((item: MedicalItem) => item.category === selectedCategory).length} items
                          </div>
                        </div>
                      </Button>
                      
                      {/* Next arrow */}
                      <Button
                        variant="medical-outline"
                        size="sm"
                        onClick={() => navigateCarousel('next')}
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                        title="Next category (→ key)"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>

                      {/* Next preview button - hidden on very small screens */}
                      <Button
                        variant="medical-ghost"
                        className="h-auto p-1 sm:p-1.5 text-right flex-shrink-0 opacity-60 hover:opacity-80 w-12 sm:w-16 justify-end hidden xs:flex"
                        onClick={() => navigateCarousel('next')}
                      >
                        <div className="w-full overflow-hidden">
                          <div className="text-xs truncate text-right leading-tight">
                            {orderedCategories[(currentCategoryIndex + 1) % orderedCategories.length]}
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Items */}
            {selectedCategory && isCarouselMode && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-medical-primary">{selectedCategory}</CardTitle>
                  {/* Show search + dropdown for Laboratory, X-Ray categories */}
                  {selectedCategory === 'Laboratory' ? (
                    <div className="space-y-4">
                      {/* Selected items, price counter and Add to Bill button above search */}
                      {selectedLabItems.length > 0 && (
                        <div className="space-y-2">
                          {/* Selected items tags */}
                          <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md">
                            {selectedLabItems.map((item) => (
                              <div key={item.id} className="inline-flex items-center bg-medical-primary/10 text-medical-primary px-2 py-1 rounded text-xs">
                                <span className="mr-1">{item.name}</span>
                                <button
                                  onClick={() => removeLabItem(item.id)}
                                  className="hover:bg-medical-primary/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Price counter on left, Add to Bill button on right */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 p-2 bg-medical-primary/5 rounded-md border border-medical-primary/20">
                              <span className="text-sm font-medium text-medical-primary">
                                Total Price: {format(selectedLabItems.reduce((sum, item) => sum + parseFloat(String(item.price)), 0))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {selectedLabItems.length} item{selectedLabItems.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Button 
                              onClick={addSelectedLabItemsToBill} 
                              variant="outline"
                              className="border-medical-primary/20 text-medical-primary hover:bg-medical-primary/10"
                            >
                              Add {selectedLabItems.length} Test{selectedLabItems.length !== 1 ? 's' : ''} to Bill
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Input
                          ref={searchInputRef}
                          placeholder="Type lab test name and press comma or enter to add..."
                          value={categorySearchQuery}
                          onChange={(e) => {
                            setCategorySearchQuery(e.target.value);
                            // Clear dropdown selections when switching to search
                            if (e.target.value.trim()) {
                              setDropdownSelectedItems([]);
                            }
                          }}
                          onKeyDown={handleLabSearchKeyDown}
                          className="w-full"
                        />
                        
                        {/* Search suggestions appear right below search input */}
                        {categorySearchQuery && getLabSuggestions().length > 0 && (
                          <div className="space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-2 bg-muted/10">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                              Matching tests (press comma to add):
                            </div>
                            {getLabSuggestions().slice(0, 5).map((item: MedicalItem, index) => {
                              const alreadyInSearch = selectedLabItems.find(selected => selected.id === item.id);
                              const alreadyInBill = billItems.find(billItem => billItem.id === item.id);
                              
                              return (
                              <div key={item.id} className={`text-xs p-2 rounded ${
                                alreadyInBill 
                                  ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                                  : alreadyInSearch
                                    ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                                    : index === 0 
                                      ? 'bg-medical-primary/10 border border-medical-primary/20 cursor-pointer hover:bg-muted/40' 
                                      : 'bg-muted/20 cursor-pointer hover:bg-muted/40'
                              }`}
                                   onClick={() => {
                                     // Check if item is already selected in search OR already in the bill
                                     const alreadyInSearch = selectedLabItems.find(selected => selected.id === item.id);
                                     const alreadyInBill = billItems.find(billItem => billItem.id === item.id);
                                     
                                     if (!alreadyInSearch && !alreadyInBill) {
                                       setSelectedLabItems(prev => [...prev, item]);
                                     }
                                     setCategorySearchQuery('');
                                     // Refocus search input after clicking suggestion
                                     setTimeout(() => {
                                       if (searchInputRef.current) {
                                         searchInputRef.current.focus();
                                       }
                                     }, 0);
                                   }}>
                                <span className="font-medium">{item.name}</span> - {format(item.price)}
                                {alreadyInBill && (
                                  <span className="ml-2 text-red-600 text-xs">● Already in Bill</span>
                                )}
                                {alreadyInSearch && !alreadyInBill && (
                                  <span className="ml-2 text-green-600 text-xs">✓ Selected</span>
                                )}
                                {index === 0 && !alreadyInBill && !alreadyInSearch && (
                                  <span className="ml-2 text-medical-primary text-xs">← Will be added</span>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Dropdown selected items as tags */}
                      {dropdownSelectedItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md">
                            {dropdownSelectedItems.map((item) => (
                              <div key={item.id} className="inline-flex items-center bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs">
                                <span className="mr-1">{item.name}</span>
                                <button
                                  onClick={() => removeDropdownItem(item.id)}
                                  className="hover:bg-blue-500/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          {/* Price counter on left, Add to Bill button on right */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 p-2 bg-blue-500/5 rounded-md border border-blue-500/20">
                              <span className="text-sm font-medium text-blue-600">
                                Total Price: {format(dropdownSelectedItems.reduce((sum, item) => sum + parseFloat(String(item.price)), 0))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {dropdownSelectedItems.length} item{dropdownSelectedItems.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Button 
                              onClick={addDropdownSelectedItemsToBill} 
                              variant="outline"
                              className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                            >
                              Add {dropdownSelectedItems.length} Test{dropdownSelectedItems.length !== 1 ? 's' : ''} to Bill
                            </Button>
                          </div>
                        </div>
                      )}
                      

                      
                      {/* Separate Dropdown Selection */}
                      <div className="space-y-2 border-t pt-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          Alternative: Select from dropdown
                        </div>
                        <div className="relative" ref={dropdownRef}>
                          <button
                            ref={dropdownButtonRef}
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(!isDropdownOpen);
                              setHighlightedDropdownIndex(-1);
                            }}
                            onKeyDown={handleDropdownKeyDown}
                            className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-md bg-background hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-medical-primary focus:ring-offset-2"
                          >
                            <span className="text-sm text-muted-foreground">
                              {dropdownFilterQuery ? `Filtering: "${dropdownFilterQuery}" (${getFilteredDropdownItems().length} matches)` : 'Select lab test from dropdown... (Type to filter)'}
                            </span>
                            <ChevronRight className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {isDropdownOpen && (
                            <div 
                              className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                            >
                              {getFilteredDropdownItems().map((item: MedicalItem, index) => (
                                <div
                                  key={item.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDropdownSelect(item.id.toString());
                                  }}
                                  className={`px-3 py-2 text-sm flex items-center justify-between ${
                                    index === highlightedDropdownIndex 
                                      ? 'bg-medical-primary/10 border-l-4 border-medical-primary' 
                                      : ''
                                  } ${
                                    dropdownSelectedItems.find(selected => selected.id === item.id)
                                      ? 'bg-blue-500/10 text-blue-600'
                                      : billItems.find(billItem => billItem.id === item.id)
                                        ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                        : 'cursor-pointer hover:bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <span>{item.name}</span>
                                    {dropdownSelectedItems.find(selected => selected.id === item.id) && (
                                      <span className="ml-2 text-blue-600 text-xs">✓ Selected</span>
                                    )}
                                    {billItems.find(billItem => billItem.id === item.id) && !dropdownSelectedItems.find(selected => selected.id === item.id) && (
                                      <span className="ml-2 text-red-600 text-xs">● Already in Bill</span>
                                    )}
                                    {index === highlightedDropdownIndex && (
                                      <span className="ml-2 text-medical-primary text-xs">← Highlighted</span>
                                    )}
                                  </div>
                                  <span className="text-medical-primary font-semibold">
                                    {format(item.price)}
                                  </span>
                                </div>
                              ))}
                              {getFilteredDropdownItems().length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No lab tests available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        • Type to search and press comma/enter to add as tags<br/>
                        • Dropdown: Type letters to filter instantly, stays open for multiple selections<br/>
                        • Arrow keys to navigate, Enter to select (filter resets after each selection)<br/>
                        • Click "Add to Bill" or outside dropdown to close • Escape to close without adding<br/>
                        • Both methods access same database but work independently<br/>
                        • <strong>Global Navigation:</strong> Use ← → arrow keys to switch categories, Escape to exit carousel
                      </div>
                    </div>
                  ) : selectedCategory === 'X-Ray' ? (
                    <div className="space-y-4">
                      {/* Selected items, price counter and Add to Bill button above search */}
                      {selectedXRayItems.length > 0 && (
                        <div className="space-y-2">
                          {/* Selected items tags */}
                          <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md">
                            {selectedXRayItems.map((item) => (
                              <div key={item.id} className="inline-flex items-center bg-medical-primary/10 text-medical-primary px-2 py-1 rounded text-xs">
                                <span className="mr-1">{item.name}</span>
                                <button
                                  onClick={() => removeXRayItem(item.id)}
                                  className="hover:bg-medical-primary/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Price counter on left, Add to Bill button on right */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 p-2 bg-medical-primary/5 rounded-md border border-medical-primary/20">
                              <span className="text-sm font-medium text-medical-primary">
                                Total Price: {format(selectedXRayItems.reduce((sum, item) => sum + parseFloat(String(item.price)), 0))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {selectedXRayItems.length} item{selectedXRayItems.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Button 
                              onClick={addSelectedXRayItemsToBill} 
                              variant="outline"
                              className="border-medical-primary/20 text-medical-primary hover:bg-medical-primary/10"
                            >
                              Add {selectedXRayItems.length} X-Ray{selectedXRayItems.length !== 1 ? 's' : ''} to Bill
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Input
                          ref={xRaySearchInputRef}
                          placeholder="Type X-Ray name and press comma or enter to add..."
                          value={categorySearchQuery}
                          onChange={(e) => {
                            setCategorySearchQuery(e.target.value);
                            // Clear dropdown selections when switching to search
                            if (e.target.value.trim()) {
                              setXRayDropdownSelectedItems([]);
                            }
                          }}
                          onKeyDown={handleXRaySearchKeyDown}
                          className="w-full"
                        />
                        
                        {/* Search suggestions appear right below search input */}
                        {categorySearchQuery && getXRaySuggestions().length > 0 && (
                          <div className="space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-2 bg-muted/10">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                              Matching X-Rays (press comma to add):
                            </div>
                            {getXRaySuggestions().slice(0, 5).map((item: MedicalItem, index) => {
                              const alreadyInSearch = selectedXRayItems.find(selected => selected.id === item.id);
                              const alreadyInBill = billItems.find(billItem => billItem.id === item.id);
                              
                              return (
                              <div key={item.id} className={`text-xs p-2 rounded ${
                                alreadyInBill 
                                  ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                                  : alreadyInSearch
                                    ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                                    : index === 0 
                                      ? 'bg-medical-primary/10 border border-medical-primary/20 cursor-pointer hover:bg-muted/40' 
                                      : 'bg-muted/20 cursor-pointer hover:bg-muted/40'
                              }`}
                                   onClick={() => {
                                     // Check if item is already in the bill
                                     const alreadyInBill = billItems.find(billItem => billItem.id === item.id);
                                     
                                     if (!alreadyInBill) {
                                       handleXRayItemSelect(item);
                                     }
                                     setCategorySearchQuery('');
                                   }}>
                                <span className="font-medium">{item.name}</span> - {format(item.price)}
                                {alreadyInBill && (
                                  <span className="ml-2 text-red-600 text-xs">● Already in Bill</span>
                                )}
                                {alreadyInSearch && !alreadyInBill && (
                                  <span className="ml-2 text-green-600 text-xs">✓ Selected</span>
                                )}
                                {index === 0 && !alreadyInBill && !alreadyInSearch && (
                                  <span className="ml-2 text-medical-primary text-xs">← Will be added</span>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Dropdown selected items as tags */}
                      {xRayDropdownSelectedItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md">
                            {xRayDropdownSelectedItems.map((item) => (
                              <div key={item.id} className="inline-flex items-center bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs">
                                <span className="mr-1">{item.name}</span>
                                <button
                                  onClick={() => removeXRayDropdownItem(item.id)}
                                  className="hover:bg-blue-500/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          {/* Price counter on left, Add to Bill button on right */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 p-2 bg-blue-500/5 rounded-md border border-blue-500/20">
                              <span className="text-sm font-medium text-blue-600">
                                Total Price: {format(xRayDropdownSelectedItems.reduce((sum, item) => sum + parseFloat(String(item.price)), 0))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {xRayDropdownSelectedItems.length} item{xRayDropdownSelectedItems.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Button 
                              onClick={addXRayDropdownSelectedItemsToBill} 
                              variant="outline"
                              className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                            >
                              Add {xRayDropdownSelectedItems.length} X-Ray{xRayDropdownSelectedItems.length !== 1 ? 's' : ''} to Bill
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div ref={xRayDropdownRef} className="relative">
                          <button
                            ref={xRayDropdownButtonRef}
                            onClick={() => setIsXRayDropdownOpen(!isXRayDropdownOpen)}
                            onKeyDown={handleXRayDropdownKeyDown}
                            className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary/20 hover:bg-muted/50"
                          >
                            <span className="text-sm text-muted-foreground">
                              {xRayDropdownFilterQuery 
                                ? `Filter: "${xRayDropdownFilterQuery}" (${getXRayFilteredDropdownItems().length} matches)`
                                : 'X-Ray Dropdown - Type to filter, arrows to navigate'
                              }
                            </span>
                            <ChevronRight className={`h-4 w-4 transition-transform ${isXRayDropdownOpen ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {/* Dropdown content */}
                          {isXRayDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {getXRayFilteredDropdownItems().map((item: MedicalItem, index) => {
                                const alreadyInDropdown = xRayDropdownSelectedItems.find(selected => selected.id === item.id);
                                const alreadyInBill = billItems.find(billItem => billItem.id === item.id);
                                const isHighlighted = index === xRayHighlightedDropdownIndex;
                                
                                return (
                                <div
                                  key={item.id}
                                  className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-muted/40 ${
                                    isHighlighted ? 'bg-medical-primary/10 border-l-2 border-medical-primary' : ''
                                  } ${
                                    alreadyInBill ? 'bg-red-50 text-red-600 cursor-not-allowed' : ''
                                  } ${
                                    alreadyInDropdown ? 'bg-green-50 text-green-600' : ''
                                  }`}
                                  onClick={() => {
                                    if (!alreadyInDropdown && !alreadyInBill) {
                                      handleXRayDropdownSelect(item.id.toString());
                                    }
                                  }}
                                >
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    {alreadyInBill && (
                                      <span className="ml-2 text-red-600 text-xs">● Already in Bill</span>
                                    )}
                                    {alreadyInDropdown && !alreadyInBill && (
                                      <span className="ml-2 text-green-600 text-xs">✓ Selected</span>
                                    )}
                                    {isHighlighted && (
                                      <span className="ml-2 text-medical-primary text-xs">← Highlighted</span>
                                    )}
                                  </div>
                                  <span className="text-medical-primary font-semibold">
                                    {format(item.price)}
                                  </span>
                                </div>
                                );
                              })}
                              {getXRayFilteredDropdownItems().length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No X-Ray items available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        • Type to search and press comma/enter to add as tags<br/>
                        • Dropdown: Type letters to filter instantly, stays open for multiple selections<br/>
                        • Arrow keys to navigate, Enter to select (filter resets after each selection)<br/>
                        • Click "Add to Bill" or outside dropdown to close • Escape to close without adding<br/>
                        • Both methods access same database but work independently<br/>
                        • <strong>Global Navigation:</strong> Use ← → arrow keys to switch categories, Escape to exit carousel
                      </div>

                      {/* X-Ray Film View Selection Interface */}
                      {showXRayViewSelection && selectedXRayForViews && (
                        <div className="mt-6 p-4 border border-medical-primary/20 rounded-lg bg-medical-primary/5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-medical-primary">
                              Select Film Views for: {selectedXRayForViews.name}
                            </h3>
                            <Button
                              onClick={cancelXRayViewSelection}
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {/* Film View Checkboxes */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="view-ap"
                                  checked={xRayViews.AP}
                                  onChange={() => handleXRayViewChange('AP')}
                                  className="w-4 h-4 text-medical-primary"
                                />
                                <label htmlFor="view-ap" className="text-sm font-medium">
                                  AP View
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="view-lat"
                                  checked={xRayViews.LAT}
                                  onChange={() => handleXRayViewChange('LAT')}
                                  className="w-4 h-4 text-medical-primary"
                                />
                                <label htmlFor="view-lat" className="text-sm font-medium">
                                  LAT View
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="view-oblique"
                                  checked={xRayViews.OBLIQUE}
                                  onChange={() => handleXRayViewChange('OBLIQUE')}
                                  className="w-4 h-4 text-medical-primary"
                                />
                                <label htmlFor="view-oblique" className="text-sm font-medium">
                                  OBLIQUE View
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="view-both"
                                  checked={xRayViews.BOTH}
                                  onChange={() => handleXRayViewChange('BOTH')}
                                  className="w-4 h-4 text-medical-primary"
                                />
                                <label htmlFor="view-both" className="text-sm font-medium">
                                  BOTH Views
                                </label>
                              </div>
                            </div>

                            {/* Off-Charge/Portable Button - only show when exactly 1 film is selected */}
                            <div className="flex items-center justify-between pt-2 border-t border-medical-primary/10">
                              <div>
                                {isOffChargePortableAllowed() ? (
                                  <Button
                                    onClick={() => setIsOffChargePortable(!isOffChargePortable)}
                                    variant={isOffChargePortable ? "medical" : "outline"}
                                    size="sm"
                                    className="flex items-center space-x-2"
                                  >
                                    <FileX className="h-4 w-4" />
                                    <span>Off-Charge/Portable</span>
                                    {isOffChargePortable && <span className="text-xs">(+50% fee)</span>}
                                  </Button>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    Off-Charge/Portable only available with at least 1 film selected
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground mb-1">
                                  Total Price: {format(parseFloat(String(selectedXRayForViews.price)) * (isOffChargePortable ? 1.5 : 1))}
                                </div>
                                <Button
                                  onClick={addXRayToBill}
                                  disabled={!isViewSelectionComplete()}
                                  variant="medical"
                                  className="flex items-center space-x-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Add X-Ray to Bill</span>
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              • Select at least one film view to proceed<br/>
                              • AP, LAT, and OBLIQUE can be combined<br/>
                              • BOTH selection will clear individual view selections<br/>
                              • Same X-Ray with different films can be added separately<br/>
                              • Same X-Ray with same film combination cannot be added twice<br/>
                              • Off-Charge/Portable only available when at least 1 film is selected<br/>
                              • Off-Charge/Portable adds 50% additional fee
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : selectedCategory === 'Medicine' ? (
                    <div className="space-y-4">
                      {/* Compact Selected Medicines Display - positioned below Medicine label */}
                      {tempSelectedMedicines.length > 0 && (
                        <div className="medicine-dosage-card p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-medical-primary flex items-center">
                              <Calculator className="h-4 w-4 mr-2" />
                              Selected: {tempSelectedMedicines.length} medicines
                            </span>
                            <span className="text-sm font-bold text-medical-primary bg-medical-primary/10 px-2 py-1 rounded-md">
                              {format(tempSelectedMedicines.reduce((sum, medicine) => sum + parseFloat(String(medicine.price)), 0))}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {tempSelectedMedicines.map((medicine, index) => (
                              <div key={medicine.tempId} className="medicine-item-card flex items-center justify-between text-sm p-2 rounded-lg">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <span className="text-xs font-bold text-medical-primary bg-medical-primary/10 px-2 py-1 rounded-md flex-shrink-0">
                                    #{index + 1}
                                  </span>
                                  <span className="font-medium text-foreground truncate">
                                    {medicine.name.length > 25 ? `${medicine.name.substring(0, 25)}...` : medicine.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <span className="text-medical-primary font-semibold bg-medical-primary/10 px-2 py-1 rounded">
                                    {format(parseFloat(String(medicine.price)))}
                                  </span>
                                  <button
                                    onClick={() => editTempMedicine(medicine)}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded transition-colors"
                                    title="Edit medicine dosage"
                                  >
                                    <Calculator className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => removeTempMedicine(medicine.tempId)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                                    title="Remove medicine"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-medical-primary/20 flex justify-end">
                            <Button
                              onClick={addAllTempMedicinesToBill}
                              variant="medical"
                              size="sm"
                              className="text-xs font-medium shadow-md hover:shadow-lg transition-shadow px-3 py-1"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add to Bill
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Medicine Dosage Selection Interface */}
                      {showMedicineDosageSelection && selectedMedicineForDosage && (
                        <div className="medicine-dosage-card mt-6 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-medical-primary flex items-center">
                              <Calculator className="h-5 w-5 mr-2" />
                              Set Dosage for: {selectedMedicineForDosage.name}
                            </h3>
                            <Button
                              onClick={cancelMedicineDosageSelection}
                              variant="medical-ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-medical-primary"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {/* First Line: Dose Prescribed, Med Type, Dose Frequency */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Dose Prescribed</label>
                                <Input
                                  ref={doseInputRef}
                                  placeholder="e.g., 500, 1, 2.5"
                                  value={dosePrescribed}
                                  onChange={(e) => setDosePrescribed(e.target.value)}
                                  className="w-full"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Med Type</label>
                                <Select value={medType} onValueChange={setMedType}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {medTypeOptions.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Dose Frequency</label>
                                <Select value={doseFrequency} onValueChange={setDoseFrequency}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {doseFrequencyOptions.map((freq) => (
                                      <SelectItem key={freq.value} value={freq.value}>
                                        {freq.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Second Line: Duration, Total Price, Add to Bill */}
                            <div className="grid grid-cols-3 gap-4 items-end">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Duration (Days)</label>
                                <Input
                                  type="number"
                                  placeholder="e.g., 7, 10"
                                  value={totalDays}
                                  onChange={(e) => setTotalDays(e.target.value)}
                                  className="w-full"
                                  min="1"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Total Price</label>
                                <div className="h-10 p-2 bg-medical-primary/10 rounded-md border border-medical-primary/20 flex items-center justify-center">
                                  <span className="text-lg font-semibold text-medical-primary">
                                    {isDosageSelectionComplete() ? format(calculateOutpatientMedicineDosage().totalPrice) : '---'}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground invisible">Add Medicine</label>
                                <Button
                                  onClick={addMedicineToTempList}
                                  disabled={!isDosageSelectionComplete()}
                                  variant="medical"
                                  className="w-full flex items-center justify-center space-x-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Add</span>
                                </Button>
                              </div>
                            </div>

                            {/* Calculation Details (Optional) */}
                            {isDosageSelectionComplete() && (
                              <div className="medicine-dosage-card p-4 rounded-lg">
                                <div className="text-sm font-medium text-medical-primary mb-3 flex items-center">
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Calculation Preview
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Base price:</span>
                                    <span className="font-medium text-medical-primary">{format(selectedMedicineForDosage.price)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Frequency:</span>
                                    <span className="font-medium">{doseFrequencyOptions.find(f => f.value === doseFrequency)?.label}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span className="font-medium">{totalDays} days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Total quantity:</span>
                                    <span className="font-medium">{calculateOutpatientMedicineDosage().totalQuantity} {calculateOutpatientMedicineDosage().quantityUnit}</span>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-medical-primary/10">
                                  <div className="text-xs text-muted-foreground">
                                    <strong>Calculation:</strong> {calculateOutpatientMedicineDosage().calculationDetails}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}



                      {/* Medicine tag-based search input */}
                      <div className="space-y-2">
                        <Input
                          ref={medicineSearchInputRef}
                          placeholder="Type medicine names, press comma/enter to add as tags..."
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          onKeyDown={handleMedicineTagKeyPress}
                          className="w-full"
                        />

                        {/* Selected items as tags */}
                        {selectedMedicineItems.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md">
                              {selectedMedicineItems.map((item) => (
                                <div key={item.id} className="inline-flex items-center bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs">
                                  <span className="mr-1">{item.name}</span>
                                  <button
                                    onClick={() => removeMedicineTagItem(item.id)}
                                    className="hover:bg-green-500/20 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4 p-2 bg-green-500/5 rounded-md border border-green-500/20">
                                <span className="text-sm font-medium text-green-600">
                                  Total Price: {format(selectedMedicineItems.reduce((sum, item) => sum + parseFloat(item.price), 0))}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {selectedMedicineItems.length} item{selectedMedicineItems.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <Button 
                                onClick={addMedicineTagItemsToBill} 
                                variant="outline"
                                className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                              >
                                Add {selectedMedicineItems.length} Medicine{selectedMedicineItems.length !== 1 ? 's' : ''} to Bill
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dropdown selected items as tags */}
                      {medicineDropdownSelectedItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 p-2 bg-muted/20 rounded-md">
                            {medicineDropdownSelectedItems.map((item) => (
                              <div key={item.id} className="inline-flex items-center bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs">
                                <span className="mr-1">{item.name}</span>
                                <button
                                  onClick={() => removeMedicineDropdownItem(item.id)}
                                  className="hover:bg-blue-500/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 p-2 bg-blue-500/5 rounded-md border border-blue-500/20">
                              <span className="text-sm font-medium text-blue-600">
                                Total Price: {format(medicineDropdownSelectedItems.reduce((sum, item) => sum + parseFloat(item.price), 0))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {medicineDropdownSelectedItems.length} item{medicineDropdownSelectedItems.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Button 
                              onClick={addMedicineDropdownSelectedItemsToBill} 
                              variant="outline"
                              className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                            >
                              Add {medicineDropdownSelectedItems.length} Medicine{medicineDropdownSelectedItems.length !== 1 ? 's' : ''} to Bill
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div ref={medicineDropdownRef} className="relative">
                          <button
                            ref={medicineDropdownButtonRef}
                            onClick={() => setIsMedicineDropdownOpen(!isMedicineDropdownOpen)}
                            onKeyDown={handleMedicineDropdownKeyDown}
                            className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary/20 hover:bg-muted/50"
                          >
                            <span className="text-sm text-muted-foreground">
                              {medicineDropdownFilterQuery 
                                ? `Filter: "${medicineDropdownFilterQuery}" (${getMedicineFilteredDropdownItems().length} matches)`
                                : 'Medicine Dropdown - Type to filter, arrows to navigate'
                              }
                            </span>
                            <ChevronRight className={`h-4 w-4 transition-transform ${isMedicineDropdownOpen ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {isMedicineDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {getMedicineFilteredDropdownItems().map((item: MedicalItem, index) => {
                                const alreadyInDropdown = medicineDropdownSelectedItems.find(selected => selected.id === item.id);
                                const alreadyInBill = billItems.find(billItem => billItem.id === item.id);
                                const isHighlighted = index === medicineHighlightedDropdownIndex;
                                
                                return (
                                <div
                                  key={item.id}
                                  className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-muted/40 ${
                                    isHighlighted ? 'bg-medical-primary/10 border-l-2 border-medical-primary' : ''
                                  } ${
                                    alreadyInBill ? 'bg-red-50 text-red-600 cursor-not-allowed' : ''
                                  } ${
                                    alreadyInDropdown ? 'bg-green-50 text-green-600' : ''
                                  }`}
                                  onClick={() => {
                                    if (!alreadyInDropdown && !alreadyInBill) {
                                      handleMedicineDropdownSelect(item.id.toString());
                                    }
                                  }}
                                >
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    {alreadyInBill && (
                                      <span className="ml-2 text-red-600 text-xs">● Already in Bill</span>
                                    )}
                                    {alreadyInDropdown && !alreadyInBill && (
                                      <span className="ml-2 text-green-600 text-xs">✓ Selected</span>
                                    )}
                                    {isHighlighted && (
                                      <span className="ml-2 text-medical-primary text-xs">← Highlighted</span>
                                    )}
                                  </div>
                                  <span className="text-medical-primary font-semibold">
                                    {format(item.price)}
                                  </span>
                                </div>
                                );
                              })}
                              {getMedicineFilteredDropdownItems().length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No Medicine items available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        • Type to search and press comma/enter to add as tags<br/>
                        • Dropdown: Type letters to filter instantly, stays open for multiple selections<br/>
                        • Arrow keys to navigate, Enter to select (filter resets after each selection)<br/>
                        • Click "Add to Bill" or outside dropdown to close • Escape to close without adding<br/>
                        • Both methods access same database but work independently<br/>
                        • <strong>Global Navigation:</strong> Use ← → arrow keys to switch categories, Escape to exit carousel
                      </div>
                    </div>
                  ) : selectedCategory === 'Medicine' ? (
                    /* Medicine help text with dosage instructions */
                    <div className="text-sm text-muted-foreground">
                      • Search or dropdown: Select medicine to open dosage calculator<br/>
                      • Set dose amount, medication type (Tablet, Mg, ml/cc, etc.)<br/>
                      • Choose frequency: QD (daily), BID (twice), TID (3x), QID (4x), QOD, QWEEK<br/>
                      • Enter total days to auto-calculate total quantity and cost<br/>
                      • Bill shows complete dosage information and calculated pricing<br/>
                      • <strong>Global Navigation:</strong> Use ← → arrow keys to switch categories, Escape to exit carousel
                    </div>
                  ) : ['Physical Therapy', 'Limb and Brace'].includes(selectedCategory) ? (
                    /* Manual entry interface for Physical Therapy and Limb and Brace */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Service Name</label>
                        <div className="relative">
                          <Input
                            ref={manualNameInputRef}
                            placeholder={`Enter ${selectedCategory} service name...`}
                            value={manualServiceName}
                            onChange={(e) => handleManualServiceNameChange(e.target.value)}
                            onKeyDown={handleManualServiceNameKeyDown}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onFocus={() => setShowSuggestions(manualServiceName.trim().length > 0)}
                            className="w-full"
                          />
                          
                          {/* Suggestions dropdown */}
                          {showSuggestions && getSuggestions().length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {getSuggestions().map((suggestion, index) => (
                                <div
                                  key={index}
                                  className={`px-3 py-2 cursor-pointer hover:bg-muted/40 ${
                                    index === highlightedSuggestionIndex ? 'bg-medical-primary/10 border-l-2 border-medical-primary' : ''
                                  }`}
                                  onClick={() => selectSuggestion(suggestion)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{suggestion.name}</span>
                                    <span className="text-xs text-medical-primary font-semibold">
                                      {format(parseFloat(suggestion.price))}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Price (BDT)</label>
                        <Input
                          ref={manualPriceInputRef}
                          type="number"
                          placeholder="Enter price..."
                          value={manualServicePrice}
                          onChange={(e) => setManualServicePrice(e.target.value)}
                          onKeyDown={handleManualPriceKeyDown}
                          className="w-full"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={addManualService}
                          disabled={!manualServiceName.trim() || !manualServicePrice.trim()}
                          variant="medical"
                          size="sm"
                          className="text-xs font-medium shadow-md hover:shadow-lg transition-shadow px-3 py-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Bill
                        </Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        • Type service name to see smart suggestions from previous entries<br/>
                        • Use arrow keys to navigate suggestions, Enter/Tab to select<br/>
                        • Enter price and press Enter to add to bill<br/>
                        • All entries are remembered for future suggestions<br/>
                        • <strong>Global Navigation:</strong> Use ← → arrow keys to switch categories, Escape to exit carousel
                      </div>
                    </div>
                  ) : (
                    /* Regular search input for other categories */
                    !categoriesWithoutSearch.includes(selectedCategory) && (
                      <Input
                        placeholder={`Search in ${selectedCategory}...`}
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="w-full"
                      />
                    )
                  )}
                </CardHeader>
                <CardContent>
                  {/* Show interface for Medicine, Laboratory, X-Ray */}
                  {selectedCategory === 'Laboratory' ? (
                    <div className="text-center text-muted-foreground py-4">
                      <div className="text-lg font-medium mb-2">Laboratory Quick Selection</div>
                      <div className="text-sm">
                        Type test names and press comma to add as tags, or use dropdown below
                      </div>
                      <div className="text-xs mt-2 opacity-75">
                        {selectedLabItems.length > 0 ? `${selectedLabItems.length} test${selectedLabItems.length !== 1 ? 's' : ''} selected` : 'No tests selected yet'}
                      </div>
                    </div>
                  ) : selectedCategory === 'X-Ray' ? (
                    <div className="text-center text-muted-foreground py-4">
                      <div className="text-lg font-medium mb-2">X-Ray Quick Selection</div>
                      <div className="text-sm">
                        Type X-Ray names and press comma to add as tags, or use dropdown below
                      </div>
                      <div className="text-xs mt-2 opacity-75">
                        {selectedXRayItems.length > 0 ? `${selectedXRayItems.length} X-Ray${selectedXRayItems.length !== 1 ? 's' : ''} selected` : 'No X-Rays selected yet'}
                      </div>
                    </div>
                  ) : selectedCategory === 'Medicine' ? (
                    <div className="text-center text-muted-foreground py-4">
                      <div className="text-lg font-medium mb-2">Medicine Dosage Calculator</div>
                      <div className="text-sm">
                        Select medicine from search or dropdown to set dosage, frequency, and duration
                      </div>
                      <div className="text-xs mt-2 opacity-75">
                        Each medicine selection opens dosage form with automatic price calculation
                      </div>
                    </div>
                  ) : ['Physical Therapy', 'Limb and Brace'].includes(selectedCategory) ? (
                    <div className="text-center text-muted-foreground py-4">
                      <div className="text-lg font-medium mb-2">{selectedCategory} Manual Entry</div>
                      <div className="text-sm">
                        Enter service name and price manually with smart suggestions from previous entries
                      </div>
                      <div className="text-xs mt-2 opacity-75">
                        {previousEntries.length > 0 ? `${previousEntries.length} previous entries available for suggestions` : 'Start typing to build your suggestion database'}
                      </div>
                    </div>
                  ) : (
                    /* Regular item list for other categories */
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(categoriesWithoutSearch.includes(selectedCategory) ? categoryItems : filteredCategoryItems).length > 0 ? (
                        (categoriesWithoutSearch.includes(selectedCategory) ? categoryItems : filteredCategoryItems).map((item: MedicalItem) => {
                          // Make Registration Fees, Dr. Fees, and Medic Fee more compact
                          const isCompactCategory = ['Registration Fees', 'Dr. Fees', 'Medic Fee'].includes(selectedCategory);
                          const isInBill = billItems.some(billItem => billItem.id === item.id);
                          
                          const handleItemClick = () => {
                            if (isInBill) {
                              // Remove from bill
                              const billItem = billItems.find(billItem => billItem.id === item.id);
                              if (billItem) {
                                removeFromBill(billItem.billId);
                              }
                            } else {
                              // Add to bill
                              addToBill(item);
                            }
                          };
                          
                          return (
                            <div 
                              key={item.id} 
                              onClick={handleItemClick}
                              className={`flex items-center justify-between ${isCompactCategory ? 'p-2' : 'p-3'} ${
                                isInBill 
                                  ? 'bg-medical-primary/20 border border-medical-primary/30' 
                                  : 'bg-muted/30'
                              } rounded-lg hover:bg-muted/50 transition-colors cursor-pointer`}
                            >
                              <div className="flex-1">
                                <div className={`font-medium ${isInBill ? 'text-medical-primary' : 'text-foreground'} ${isCompactCategory ? 'text-sm' : ''}`}>
                                  {item.name}
                                  {isInBill && <span className="ml-2 text-xs">✓ Added</span>}
                                </div>
                                {item.description && (
                                  <div className={`text-muted-foreground ${isCompactCategory ? 'text-xs' : 'text-sm'}`}>{item.description}</div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-semibold text-medical-primary ${isCompactCategory ? 'text-sm' : ''}`}>
                                  {format(item.price)}
                                </span>
                                <div 
                                  className={`flex items-center justify-center ${
                                    isCompactCategory ? "h-7 w-7" : "h-8 w-8"
                                  } rounded ${
                                    isInBill 
                                      ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30' 
                                      : 'bg-medical-primary/20 text-medical-primary hover:bg-medical-primary/30'
                                  } transition-colors`}
                                >
                                  {isInBill ? (
                                    <X className={isCompactCategory ? "h-3 w-3" : "h-4 w-4"} />
                                  ) : (
                                    <Plus className={isCompactCategory ? "h-3 w-3" : "h-4 w-4"} />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          {!categoriesWithoutSearch.includes(selectedCategory) && categorySearchQuery ? 'No items found matching your search.' : 'No items in this category.'}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Bill Summary */}
          <div>
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-medical-primary">
                  <span className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Bill Summary
                  </span>
                  {billItems.length > 0 && (
                    <Button size="sm" variant="medical-ghost" onClick={clearBill}>
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billItems.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {Object.entries(getBillItemsByCategory).map(([category, items]) => (
                        <div key={category} className="border-l-4 border-medical-primary/30 pl-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-medical-primary text-sm">{category}</h4>
                            <span className="text-sm font-medium text-medical-primary">
                              {format(calculateCategoryTotal(items))}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {items.map((item) => {
                              const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                              return (
                                <div key={item.billId} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-foreground">{item.name}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-medical-primary font-medium">
                                      {format(price)}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="medical-ghost"
                                      onClick={() => removeFromBill(item.billId)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-medical-secondary/20 pt-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span className="text-foreground">Grand Total:</span>
                        <span className="text-medical-primary">{format(calculateTotal)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items added to bill yet.</p>
                    <p className="text-sm">Search for items or select a category to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Duplicate Item Confirmation Dialog */}
      <Dialog open={duplicateDialog.open} onOpenChange={(open) => setDuplicateDialog({ open, item: duplicateDialog.item })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Item Already in Bill
            </DialogTitle>
            <DialogDescription>
              The item "{duplicateDialog.item?.name}" is already in your bill. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="font-medium text-sm">{duplicateDialog.item?.name}</div>
              <div className="text-xs text-muted-foreground">{duplicateDialog.item?.category}</div>
              <div className="text-sm font-semibold text-medical-primary">
                {duplicateDialog.item && format(duplicateDialog.item.price)}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              variant="default" 
              onClick={() => handleDuplicateAction('add')}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              Add Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDuplicateAction('skip')}
              className="w-full sm:w-auto"
            >
              Skip
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDuplicateAction('remove')}
              className="w-full sm:w-auto"
            >
              Remove Existing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Outpatient;