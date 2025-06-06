export enum CategoryEnum {
    ELECTRONICS = 1,
    CLOTHING = 2,
    HOME_APPLIANCES = 3,
  }
  
  export enum SubCategoryEnum {
    MOBILE_PHONES = 101, // ELECTRONICS
    LAPTOPS = 102,
    MEN_CLOTHING = 201, // CLOTHING
    WOMEN_CLOTHING = 202,
    KITCHEN_APPLIANCES = 301, // HOME_APPLIANCES
    CLEANING_DEVICES = 302,
  }
export const CategoryEnumMap = {
  [CategoryEnum.ELECTRONICS]: 'ELECTRONICS',
  [CategoryEnum.CLOTHING]: 'CLOTHING',
  [CategoryEnum.HOME_APPLIANCES]: 'HOME_APPLIANCES',
};

export const SubCategoryEnumMap = {
  [SubCategoryEnum.MOBILE_PHONES]: 'MOBILE_PHONES',
  [SubCategoryEnum.LAPTOPS]: 'LAPTOPS',
  [SubCategoryEnum.MEN_CLOTHING]: 'MEN_CLOTHING',
  [SubCategoryEnum.WOMEN_CLOTHING]: 'WOMEN_CLOTHING',
  [SubCategoryEnum.KITCHEN_APPLIANCES]: 'KITCHEN_APPLIANCES',
  [SubCategoryEnum.CLEANING_DEVICES]: 'CLEANING_DEVICES',
};