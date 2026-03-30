import { ICategory, IListProductsQuery, IProduct, IProductDetail, IProductListResponse } from '../interfaces';

export const MOCK_CATEGORIES: ICategory[] = [
	{
		id: 1,
		name: 'Điện thoại',
		description: 'Điện thoại thông minh',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: 2,
		name: 'Laptop',
		description: 'Máy tính xách tay',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: 3,
		name: 'Tai nghe',
		description: 'Tai nghe & Loa',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: 4,
		name: 'Đồng hồ',
		description: 'Đồng hồ thông minh & thời trang',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: 5,
		name: 'Phụ kiện',
		description: 'Phụ kiện điện tử',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
];

const ALL_PRODUCTS: IProduct[] = [
	{
		id: '1a2b3c4d-0001-0000-0000-000000000001',
		name: 'iPhone 15 Pro Max 256GB',
		description: 'Chip A17 Pro, camera 48MP, màn hình 6.7 inch Super Retina XDR',
		price: 34990000,
		category_id: 1,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0002-0000-0000-000000000002',
		name: 'Samsung Galaxy S24 Ultra',
		description: 'Snapdragon 8 Gen 3, S Pen, camera 200MP, pin 5000mAh',
		price: 31990000,
		category_id: 1,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0003-0000-0000-000000000003',
		name: 'Xiaomi 14 Ultra',
		description: 'Camera Leica, Snapdragon 8 Gen 3, sạc 90W',
		price: 22990000,
		category_id: 1,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0004-0000-0000-000000000004',
		name: 'OPPO Find X7 Pro',
		description: 'Camera Hasselblad, màn hình LTPO 120Hz, pin 5000mAh',
		price: 19990000,
		category_id: 1,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0005-0000-0000-000000000005',
		name: 'MacBook Pro 14" M3 Pro',
		description: 'Chip M3 Pro, RAM 18GB, SSD 512GB, màn hình Liquid Retina XDR',
		price: 52990000,
		category_id: 2,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0006-0000-0000-000000000006',
		name: 'Dell XPS 15 OLED',
		description: 'Core i7-13700H, RTX 4060, RAM 16GB, màn hình OLED 3.5K',
		price: 45990000,
		category_id: 2,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0007-0000-0000-000000000007',
		name: 'Asus ROG Zephyrus G14',
		description: 'Ryzen 9 7940HS, RTX 4060, RAM 16GB, màn hình 165Hz',
		price: 38990000,
		category_id: 2,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0008-0000-0000-000000000008',
		name: 'Lenovo ThinkPad X1 Carbon',
		description: 'Core i7-1365U, RAM 16GB, SSD 512GB, nhẹ chỉ 1.12kg',
		price: 42990000,
		category_id: 2,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0009-0000-0000-000000000009',
		name: 'AirPods Pro 2nd Generation',
		description: 'Chống ồn chủ động H2, âm thanh Spatial Audio, pin 30h',
		price: 6490000,
		category_id: 3,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0010-0000-0000-000000000010',
		name: 'Sony WH-1000XM5',
		description: 'Chống ồn hàng đầu, pin 30h, âm thanh Hi-Res',
		price: 8490000,
		category_id: 3,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0011-0000-0000-000000000011',
		name: 'Bose QuietComfort 45',
		description: 'Chống ồn Bose, kết nối đa điểm, pin 24h',
		price: 7990000,
		category_id: 3,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0012-0000-0000-000000000012',
		name: 'Samsung Galaxy Buds3 Pro',
		description: 'ANC thông minh, âm thanh 360, kết nối với Galaxy AI',
		price: 4990000,
		category_id: 3,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0013-0000-0000-000000000013',
		name: 'Apple Watch Series 9 45mm',
		description: 'Chip S9, màn hình Always-On, theo dõi sức khỏe toàn diện',
		price: 12990000,
		category_id: 4,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0014-0000-0000-000000000014',
		name: 'Samsung Galaxy Watch 6 Classic',
		description: 'Vòng bezel xoay, theo dõi sức khỏe, pin 40h',
		price: 8990000,
		category_id: 4,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0015-0000-0000-000000000015',
		name: 'Garmin Fenix 7 Pro',
		description: 'GPS đa băng tần, pin 22 ngày, chống nước 100m',
		price: 18990000,
		category_id: 4,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0016-0000-0000-000000000016',
		name: 'Cáp sạc USB-C 100W',
		description: 'Sạc nhanh PD 100W, dài 2m, bọc dù bền bỉ',
		price: 299000,
		category_id: 5,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0017-0000-0000-000000000017',
		name: 'Sạc dự phòng Anker 20000mAh',
		description: 'Sạc nhanh 22.5W, 2 cổng USB-A + 1 USB-C',
		price: 899000,
		category_id: 5,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0018-0000-0000-000000000018',
		name: 'Ốp lưng MagSafe iPhone 15',
		description: 'Chất liệu silicon cao cấp, tương thích MagSafe',
		price: 450000,
		category_id: 5,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0019-0000-0000-000000000019',
		name: 'Hub USB-C 7-in-1 Baseus',
		description: 'HDMI 4K, 3x USB-A, SD/TF, PD 100W',
		price: 790000,
		category_id: 5,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
	{
		id: '1a2b3c4d-0020-0000-0000-000000000020',
		name: 'Google Pixel 8 Pro',
		description: 'Chip Tensor G3, camera AI, Android thuần, cập nhật 7 năm',
		price: 26990000,
		category_id: 1,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getMockProducts = async (params: IListProductsQuery): Promise<IProductListResponse> => {
	await sleep(600);

	let filtered = [...ALL_PRODUCTS];

	if (params.category_id) {
		filtered = filtered.filter((p) => p.category_id === params.category_id);
	}

	if (params.search?.trim()) {
		const keyword = params.search.trim().toLowerCase();
		filtered = filtered.filter(
			(p) => p.name.toLowerCase().includes(keyword) || p.description?.toLowerCase().includes(keyword)
		);
	}

	const page = params.page ?? 1;
	const limit = params.limit ?? 12;
	const total = filtered.length;
	const total_pages = Math.ceil(total / limit) || 1;
	const items = filtered.slice((page - 1) * limit, page * limit);

	return { items, total, page, limit, total_pages };
};

export const getMockProduct = async (id: string): Promise<IProductDetail> => {
	await sleep(400);
	const product = ALL_PRODUCTS.find((p) => p.id === id);
	if (!product) throw new Error('Product not found');
	return { ...product, images: [] };
};

export const getMockCategories = async (): Promise<ICategory[]> => {
	await sleep(300);
	return MOCK_CATEGORIES;
};
