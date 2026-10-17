import { Coffee, Landmark, Trees, UtensilsCrossed, Ghost, Trophy, Zap } from "lucide-react";
import placeCafe from "@/assets/place-cafe.jpg";
import placeTemple from "@/assets/place-temple.jpg";
import placeNature from "@/assets/place-nature.jpg";
import placeFood from "@/assets/place-food.jpg";
import placeMystery from "@/assets/place-mystery.jpg";

export interface Category {
  value: string;       // used in DB + URL params
  label: string;       // display name
  icon: any;           // lucide icon component
  image: string;       // card background image
}

export const CATEGORIES: Category[] = [
  { value: "cafes",        label: "Cafes",        icon: Coffee,         image: placeCafe    },
  { value: "temples",      label: "Temples",      icon: Landmark,       image: placeTemple  },
  { value: "nature",       label: "Nature",       icon: Trees,          image: placeNature  },
  { value: "food",         label: "Food",         icon: UtensilsCrossed, image: placeFood   },
  { value: "mystery",      label: "Mystery",      icon: Ghost,          image: placeMystery },
  { value: "sports",       label: "Sports",       icon: Trophy,         image: placeNature  },
  { value: "fun-activity", label: "Fun Activity", icon: Zap,            image: placeCafe    },
];

// quick lookup helpers
export const categoryByValue = (value: string) =>
  CATEGORIES.find((c) => c.value === value);

export const categoryLabel = (value: string) =>
  categoryByValue(value)?.label ?? value;

export const categoryIcon = (value: string) =>
  categoryByValue(value)?.icon ?? Ghost;

export const categoryImage = (value: string) =>
  categoryByValue(value)?.image ?? placeCafe;
