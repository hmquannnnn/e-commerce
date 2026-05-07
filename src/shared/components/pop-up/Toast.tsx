import { toast as sonnerToast, type ExternalToast } from 'sonner';
import { Alert, AlertTitle, EAlertVariant } from '../base/ui/alert';
import { XIcon } from 'lucide-react';

interface IToastProps {
	variant: EAlertVariant;
	content: string;
	shouldShowIcon?: boolean;
	shouldShowAction?: boolean;
	onDismiss: () => void;
}

export type TriggerToastOptions = Omit<
	IToastProps & Pick<ExternalToast, 'duration' | 'position' | 'onAutoClose'>,
	'onDismiss'
>;

export const triggerToast = ({ variant, content, ...otherProps }: TriggerToastOptions) =>
	sonnerToast.custom((id) => <Toast variant={variant} content={content} onDismiss={() => sonnerToast.dismiss(id)} />, {
		position: 'top-right',
		...otherProps,
	});

const Toast = ({ variant = EAlertVariant.Info, content, shouldShowAction = true, onDismiss }: IToastProps) => {
	return (
		<Alert variant={variant}>
			<AlertTitle>
				{content}{' '}
				{shouldShowAction && (
					<button
						type="button"
						className="btn btn-circle btn-ghost btn-xs text-foreground ml-2 text-xs hover:opacity-60"
						onClick={() => onDismiss()}
					>
						<XIcon />
					</button>
				)}
			</AlertTitle>
		</Alert>
	);
};

export default Toast;
