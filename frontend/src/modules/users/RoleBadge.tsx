import { Badge, type BadgeTone } from '../../components/Badge'
import { ROLE_LABELS, type Role } from '../../lib/roles'

const ROLE_TONES: Record<Role, BadgeTone> = {
  super_admin: 'amber',
  admin: 'brand',
  employee: 'gray',
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</Badge>
}
