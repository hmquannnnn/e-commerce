/**
 * Vietnam administrative location unit shared shape (province, district, ward).
 * Matches the backend `model.LocationUnit` in order-service.
 */
export interface ILocationUnit {
	code: string;
	name: string;
	full_name: string;
	code_name: string;
}
