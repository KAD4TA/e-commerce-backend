import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service';

import { Repository } from 'typeorm';
import { CategoryEnum, SubCategoryEnum } from 'src/common/enums/category.enum';
import { Categories } from 'src/typeorm';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: Repository<Categories>;

  const mockCategories = [
    { categoryId: CategoryEnum.ELECTRONICS, subCategoryId: SubCategoryEnum.MOBILE_PHONES },
    { categoryId: CategoryEnum.ELECTRONICS, subCategoryId: SubCategoryEnum.LAPTOPS },
    { categoryId: CategoryEnum.CLOTHING, subCategoryId: SubCategoryEnum.MEN_CLOTHING },
    { categoryId: CategoryEnum.CLOTHING, subCategoryId: SubCategoryEnum.WOMEN_CLOTHING },
    { categoryId: CategoryEnum.HOME_APPLIANCES, subCategoryId: SubCategoryEnum.KITCHEN_APPLIANCES },
    { categoryId: CategoryEnum.HOME_APPLIANCES, subCategoryId: SubCategoryEnum.CLEANING_DEVICES },
  ];

  const mockCategoryRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Categories),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<Repository<Categories>>(getRepositoryToken(Categories));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seedCategories', () => {
    it('should save new categories if they do not exist', async () => {
      // Arrange: Mock findOne to return null (category doesn't exist)
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.save.mockResolvedValue({});

      // Act
      await service.seedCategories();

      // Assert
      expect(mockCategoryRepository.findOne).toHaveBeenCalledTimes(mockCategories.length);
      expect(mockCategoryRepository.save).toHaveBeenCalledTimes(mockCategories.length);
      for (const category of mockCategories) {
        expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
          where: { categoryId: category.categoryId, subCategoryId: category.subCategoryId },
        });
        expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
      }
    });

    it('should not save categories that already exist', async () => {
  // Arrange: Mock findOne to return an existing category only for the first category
  mockCategoryRepository.findOne.mockImplementation((options) => {
    const { where } = options;
    // Log the where clause for debugging
    console.log('findOne called with:', where);
    if (
      where.categoryId === mockCategories[0].categoryId &&
      where.subCategoryId === mockCategories[0].subCategoryId
    ) {
      console.log('Returning existing category for:', where);
      return Promise.resolve({ id: 1, ...mockCategories[0] });
    }
    console.log('Returning null for:', where);
    return Promise.resolve(null);
  });
  mockCategoryRepository.save.mockImplementation((category) => {
    console.log('save called with:', category);
    return Promise.resolve({ id: mockCategories.indexOf(category) + 1, ...category });
  });

  // Act
  await service.seedCategories();

  // Assert
  expect(mockCategoryRepository.findOne).toHaveBeenCalledTimes(mockCategories.length);
  expect(mockCategoryRepository.save).toHaveBeenCalledTimes(mockCategories.length - 1); 
  expect(mockCategoryRepository.save).not.toHaveBeenCalledWith(mockCategories[0]);
});

    it('should log success message', async () => {
      // Arrange
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.save.mockResolvedValue({});
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.seedCategories();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(' Kategoriler başarıyla eklendi.');
      consoleLogSpy.mockRestore();
    });

    it('should handle errors during category seeding', async () => {
      // Arrange
      mockCategoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.seedCategories()).rejects.toThrow('Database error');
      expect(mockCategoryRepository.findOne).toHaveBeenCalled();
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });
});