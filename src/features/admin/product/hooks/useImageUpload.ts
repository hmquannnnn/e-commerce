'use client';

import { useState, useCallback } from 'react';
import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import { IGetPresignedUrlResponse, IProductImageFormItem } from '../interfaces';

const authClient = initializeApiClientInstance({});

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? 'http://localhost:9000';

const getPresignedUrl = async (productId: string, contentType: string): Promise<IGetPresignedUrlResponse> =>
	authClient
		.post<IApiResponse<IGetPresignedUrlResponse>>('/files/presigned-url', {
			file_type: 'product',
			content_type: contentType,
			product_id: productId,
		})
		.then((res) => res.data.data);

const uploadToMinIO = async (presignedUrl: string, file: File): Promise<void> => {
	const res = await fetch(presignedUrl, {
		method: 'PUT',
		body: file,
		headers: { 'Content-Type': file.type },
	});
	if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
};

export const useImageUpload = (productId: string | undefined) => {
	const [images, setImages] = useState<IProductImageFormItem[]>([]);

	const addImages = useCallback(
		async (files: File[]) => {
			if (!productId) return;

			const newItems: IProductImageFormItem[] = files.map((file, i) => ({
				file,
				preview: URL.createObjectURL(file),
				is_primary: images.length === 0 && i === 0,
				display_order: images.length + i,
				uploading: true,
			}));

			setImages((prev) => [...prev, ...newItems]);

			// Upload each file in parallel
			await Promise.all(
				newItems.map(async (item, idx) => {
					const globalIdx = images.length + idx;
					try {
						const { presigned_url, file_path } = await getPresignedUrl(productId, item.file.type);
						await uploadToMinIO(presigned_url, item.file);

						const publicUrl = `${STORAGE_BASE_URL}/${file_path}`;

						setImages((prev) =>
							prev.map((img, i) =>
								i === globalIdx ? { ...img, file_path, public_url: publicUrl, uploading: false } : img
							)
						);
					} catch (err) {
						const message = err instanceof Error ? err.message : 'Upload failed';
						setImages((prev) =>
							prev.map((img, i) => (i === globalIdx ? { ...img, uploading: false, error: message } : img))
						);
					}
				})
			);
		},
		[productId, images.length]
	);

	const removeImage = useCallback((index: number) => {
		setImages((prev) => {
			const next = prev.filter((_, i) => i !== index);
			// Reassign display order
			return next.map((img, i) => ({ ...img, display_order: i }));
		});
	}, []);

	const setPrimary = useCallback((index: number) => {
		setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === index })));
	}, []);

	const uploadedImages = images.filter((img) => img.public_url && !img.uploading && !img.error);
	const isUploading = images.some((img) => img.uploading);

	return { images, addImages, removeImage, setPrimary, uploadedImages, isUploading };
};
