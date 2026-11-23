export interface ScannedProduct {
  code: string;
  name: string;
  category: string;
  imageUrl: string | null;
}

export interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_es?: string;
  generic_name?: string;
  categories?: string;
  image_front_url?: string;
  image_url?: string;
}
