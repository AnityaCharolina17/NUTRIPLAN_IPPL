import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { weeklySchedule as initialSchedule, menuItems as initialMenuItems, MenuItem, WeeklySchedule, DetailedNutrition } from '../lib/menuData';
import { api } from '../lib/api';

interface MenuHistory {
  id: string;
  menuId: string;
  servedDate: string;
  servedDay: string;
}

interface MenuContextType {
  weeklySchedule: WeeklySchedule[];
  menuItems: MenuItem[];
  menuHistory: MenuHistory[];
  updateWeeklySchedule: (day: string, menuId: string, mainIngredient?: string) => void;
  addMenuItem: (menu: MenuItem) => void;
  addToHistory: (menuId: string, servedDate: string, servedDay: string) => void;
  getServedMenus: () => MenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const getCurrentMonday = () => {
    const d = new Date();
    const day = d.getDay(); // 0-6 (0=Sun)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday of current week
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  const buildCurrentWeekSchedule = (): WeeklySchedule[] => {
    const monday = getCurrentMonday();
    return initialSchedule.map((sched, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return { ...sched, date: formatDate(d) };
    });
  };

  const buildLastWeekHistory = (): MenuHistory[] => {
    const today = new Date();
    const history: MenuHistory[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const servedDate = d.toISOString();
      const servedDay = d.toLocaleDateString('id-ID', { weekday: 'long' });
      const menuPick = initialMenuItems[(i - 1) % initialMenuItems.length];
      history.push({
        id: `history-${servedDate}-${i}`,
        menuId: menuPick.id,
        servedDate,
        servedDay,
      });
    }
    return history;
  };

  // Load from localStorage or use defaults
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>(() => {
    const saved = localStorage.getItem('nutriplan_weekly_schedule');
    const lastUpdate = localStorage.getItem('nutriplan_schedule_updated');
    
    // Check if we need to rebuild (new week or no saved data)
    const currentMonday = getCurrentMonday();
    const mondayKey = currentMonday.toISOString().split('T')[0];
    
    // Force rebuild if saved schedule has more than 5 days (includes Saturday)
    const scheduleToCheck = saved ? JSON.parse(saved) : [];
    const needsRebuild = !saved || lastUpdate !== mondayKey || scheduleToCheck.length !== 5;
    
    if (needsRebuild) {
      // New week or no data, rebuild and save the week key
      localStorage.setItem('nutriplan_schedule_updated', mondayKey);
      return buildCurrentWeekSchedule();
    }
    
    return scheduleToCheck;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('nutriplan_menu_items');
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const [menuHistory, setMenuHistory] = useState<MenuHistory[]>(() => {
    const saved = localStorage.getItem('nutriplan_menu_history');
    return saved ? JSON.parse(saved) : buildLastWeekHistory();
  });

  // Fetch current week menu from backend once on mount
  useEffect(() => {
    // Fetch current week menu
    api.get('/menus/current')
      .then((res) => {
        if (res.data?.success && res.data?.menu?.items) {
          const items = res.data.menu.items;
          // Map backend items to MenuItem shape with imageUrl
          const mapped: MenuItem[] = items.map((it: any) => ({
            id: it.id,
            day: it.day,
            name: it.mainDish,
            description: `${it.sideDish}, ${it.vegetable}, ${it.fruit}`,
            category: 'Lunch',
            mainIngredient: it.mainDish,
            ingredients: it.ingredients?.map((ing: any) => ing.ingredient) || [],
            allergens: (it.allergens || []).map((a: any) => a.allergen || a),
            calories: it.calories || 0,
            imageUrl: it.imageUrl || '',
            nutritionFacts: {
              calories: it.calories || 0,
              protein: parseInt(it.protein || '0'),
              carbs: parseInt(it.carbs || '0'),
              fat: parseInt(it.fat || '0'),
              fiber: 0,
            },
            portions: (it.ingredients || []).map((ing: any) => ({
              item: ing.ingredient,
              amount: ing.quantity || '',
              weight: `${ing.quantity || ''} ${ing.unit || ''}`.trim(),
            })),
          }));
          // Merge: override imageUrl and basic fields from backend, preserve local details (description, portions, nutritionFacts) when backend lacks them
          setMenuItems((prev) => {
            const prevMap = new Map(prev.map(p => [p.id, p]));
            const emptyNutrition: DetailedNutrition = {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sodium: 0,
              calcium: 0,
              iron: 0,
              vitaminA: 0,
              vitaminC: 0,
            };
            const merged: MenuItem[] = mapped.map((m): MenuItem => {
              const existing = prevMap.get(m.id);
              // Start from existing micronutrients if available, then override with backend macros
              const baseNF: DetailedNutrition = existing?.nutritionFacts || emptyNutrition;
              const nutritionFacts: DetailedNutrition = {
                ...emptyNutrition,
                ...baseNF,
                calories: m.nutritionFacts?.calories ?? baseNF.calories ?? emptyNutrition.calories,
                protein: m.nutritionFacts?.protein ?? baseNF.protein ?? emptyNutrition.protein,
                carbs: m.nutritionFacts?.carbs ?? baseNF.carbs ?? emptyNutrition.carbs,
                fat: m.nutritionFacts?.fat ?? baseNF.fat ?? emptyNutrition.fat,
                fiber: m.nutritionFacts?.fiber ?? baseNF.fiber ?? emptyNutrition.fiber,
                sodium: m.nutritionFacts?.sodium ?? baseNF.sodium ?? emptyNutrition.sodium,
                calcium: m.nutritionFacts?.calcium ?? baseNF.calcium ?? emptyNutrition.calcium,
                iron: m.nutritionFacts?.iron ?? baseNF.iron ?? emptyNutrition.iron,
                vitaminA: m.nutritionFacts?.vitaminA ?? baseNF.vitaminA ?? emptyNutrition.vitaminA,
                vitaminC: m.nutritionFacts?.vitaminC ?? baseNF.vitaminC ?? emptyNutrition.vitaminC,
              };
              const portions = (m.portions && m.portions.length > 0)
                ? m.portions
                : existing?.portions || [];

              if (!existing) return { ...m, nutritionFacts, portions };

              return {
                ...existing,
                ...m,
                nutritionFacts,
                portions,
              };
            });
            // include any previous items not present in backend response
            const backendIds = new Set(mapped.map(m => m.id));
            prev.forEach(p => { if (!backendIds.has(p.id)) merged.push(p); });
            return merged;
          });

          // Update weekly schedule to use API menu IDs by matching day
          setWeeklySchedule((prev) => {
            const byDay = new Map<string, MenuItem>();
            mapped.forEach((m: any) => {
              if (m.day) {
                byDay.set(m.day, m);
              }
            });
            return prev.map((s) => {
              const apiItem = byDay.get(s.day as any);
              if (apiItem) {
                return {
                  ...s,
                  menuId: apiItem.id,
                  mainIngredient: apiItem.mainIngredient,
                };
              }
              return s;
            });
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch current menu', err?.message || err);
      });

    // Fetch past menus for history (last 4 weeks)
    const fetchHistory = async () => {
      try {
        const historyData: MenuHistory[] = [];
        const today = new Date();
        
        for (let weeksBack = 1; weeksBack <= 4; weeksBack++) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - (weeksBack * 7));
          const monday = new Date(pastDate);
          const day = monday.getDay();
          const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
          monday.setDate(diff);
          monday.setHours(0, 0, 0, 0);
          
          const res = await api.get(`/menus/week/${monday.toISOString()}`);
          if (res.data?.success && res.data?.menu?.items) {
            res.data.menu.items.forEach((item: any) => {
              const itemDate = new Date(res.data.menu.weekStart);
              const dayIndex = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].indexOf(item.day);
              itemDate.setDate(itemDate.getDate() + dayIndex);
              
              historyData.push({
                id: `history-${item.id}`,
                menuId: item.id,
                servedDate: itemDate.toISOString(),
                servedDay: item.day,
              });
            });
          }
        }
        
        if (historyData.length > 0) {
          setMenuHistory(historyData);
        }
      } catch (error) {
        console.log('Could not fetch menu history');
      }
    };
    fetchHistory();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('nutriplan_weekly_schedule', JSON.stringify(weeklySchedule));
  }, [weeklySchedule]);

  useEffect(() => {
    localStorage.setItem('nutriplan_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('nutriplan_menu_history', JSON.stringify(menuHistory));
  }, [menuHistory]);

  const updateWeeklySchedule = (day: string, menuId: string, mainIngredient?: string) => {
    setWeeklySchedule(prev =>
      prev.map(schedule =>
        schedule.day === day
          ? { ...schedule, menuId, ...(mainIngredient && { mainIngredient }) }
          : schedule
      )
    );
  };

  const addMenuItem = (menu: MenuItem) => {
    setMenuItems(prev => {
      // Check if menu already exists
      const exists = prev.find(m => m.id === menu.id);
      if (exists) {
        // Update existing menu
        return prev.map(m => m.id === menu.id ? menu : m);
      }
      // Add new menu
      return [...prev, menu];
    });
  };

  const addToHistory = (menuId: string, servedDate: string, servedDay: string) => {
    const historyEntry: MenuHistory = {
      id: `history-${Date.now()}`,
      menuId,
      servedDate,
      servedDay
    };
    setMenuHistory(prev => [...prev, historyEntry]);
  };

  const getServedMenus = (): MenuItem[] => {
    // Get unique menu IDs from history
    const servedMenuIds = [...new Set(menuHistory.map(h => h.menuId))];
    // Return menu items that have been served
    return menuItems.filter(menu => servedMenuIds.includes(menu.id));
  };

  return (
    <MenuContext.Provider value={{
      weeklySchedule,
      menuItems,
      menuHistory,
      updateWeeklySchedule,
      addMenuItem,
      addToHistory,
      getServedMenus
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
