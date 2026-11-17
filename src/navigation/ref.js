import { createNavigationContainerRef } from '@react-navigation/native';

// Нужен, чтобы открывать экраны не из экранов (например, по нажатию на уведомление)
export const navigationRef = createNavigationContainerRef();
