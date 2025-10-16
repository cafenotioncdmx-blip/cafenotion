// Coffee options configuration and state management
export interface CoffeeOption {
  id: string;
  name: string;
  display_name: string;
  uses_milk: boolean;
  enabled: boolean;
  sort_order: number;
}

// Initial coffee options data
const initialCoffeeOptions: CoffeeOption[] = [
  {
    id: "1",
    name: "Espresso",
    display_name: "1 – Espresso",
    uses_milk: false,
    enabled: true,
    sort_order: 1,
  },
  {
    id: "2",
    name: "Americano",
    display_name: "2 – Americano",
    uses_milk: false,
    enabled: true,
    sort_order: 2,
  },
  {
    id: "3",
    name: "Flat White",
    display_name: "3 – Flat White",
    uses_milk: true,
    enabled: true,
    sort_order: 3,
  },
  {
    id: "4",
    name: "Latte",
    display_name: "4 – Latte",
    uses_milk: true,
    enabled: true,
    sort_order: 4,
  },
  {
    id: "5",
    name: "Iced Americano",
    display_name: "5 – Iced Americano",
    uses_milk: false,
    enabled: true,
    sort_order: 5,
  },
  {
    id: "6",
    name: "Iced Latte",
    display_name: "6 – Iced Latte",
    uses_milk: true,
    enabled: true,
    sort_order: 6,
  },
  {
    id: "7",
    name: "Iced Matcha Latte",
    display_name: "7 – Iced Matcha Latte",
    uses_milk: true,
    enabled: true,
    sort_order: 7,
  },
  {
    id: "8",
    name: "Iced Horchata Matcha",
    display_name: "8 – Iced Horchata Matcha",
    uses_milk: true,
    enabled: true,
    sort_order: 8,
  },
  {
    id: "9",
    name: "Iced Horchata Coffee",
    display_name: "9 – Iced Horchata Coffee",
    uses_milk: true,
    enabled: true,
    sort_order: 9,
  },
];

// Mutable state for runtime modifications
// eslint-disable-next-line prefer-const
let coffeeOptionsState = [...initialCoffeeOptions];

// Export functions to interact with the state
export const getCoffeeOptions = () => coffeeOptionsState;

export const getEnabledCoffeeOptions = () => 
  coffeeOptionsState.filter((option) => option.enabled);

export const updateCoffeeOption = (id: string, enabled: boolean) => {
  const optionIndex = coffeeOptionsState.findIndex((option) => option.id === id);
  if (optionIndex !== -1) {
    coffeeOptionsState[optionIndex].enabled = enabled;
    return coffeeOptionsState[optionIndex];
  }
  return null;
};

export const resetCoffeeOptions = () => {
  coffeeOptionsState = [...initialCoffeeOptions];
};
