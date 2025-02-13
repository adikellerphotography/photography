
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export function getIcon(name: string): LucideIcon {
  // Default to a basic icon if the requested one doesn't exist
  const IconComponent = (LucideIcons as Record<string, LucideIcon>)[name] || LucideIcons.CircleIcon;
  return IconComponent;
}
