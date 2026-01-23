'use client';

import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store, persistor } from './store';

interface AppProviderProps {
	children: ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</PersistGate>
		</Provider>
	);
};

export default AppProvider;