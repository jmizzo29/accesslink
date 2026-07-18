export type WheelchairRating = 'full' | 'partial' | 'none' | 'unknown';

export type AccessibilityCloudPlace = {
  _id: string;
  name?: string;
  address?: string;
  category?: string;
  distance?: number;
  accessibility?: {
    accessibleWith?: {
      wheelchair?: boolean;
    };
    partiallyAccessibleWith?: {
      wheelchair?: boolean;
    };
  };
};

export type AccessibilityCloudFeature = {
  type: 'Feature';
  geometry?: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: AccessibilityCloudPlace;
};

export type AccessibilityCloudResponse = {
  type: 'FeatureCollection';
  featureCount?: number;
  features: AccessibilityCloudFeature[];
};
