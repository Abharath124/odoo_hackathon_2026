import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { fetchUsers, editUser, resetUserPassword } from '../../store/usersSlice'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Modal, ModalFooter } from '../../components/ui/Modal'
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TableEmpty, TableLoading } from '../../components/ui/Table'
import api from '../../utils/api'

const COUNTRY_CODES = [
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+86', label: '🇨🇳 +86' },
]

const addUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  countryCode: z.string().min(1, 'Required'),
  phone: z.string().min(7, 'Enter a valid phone number').max(15).regex(/^\d+$/, 'Digits only'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(1, 'Required'),
  role: z.enum(['user', 'admin']),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

const resetSchema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

function AddUserModal({ onClose, onAdded }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: { role: 'user', countryCode: '+91' },
  })

  const onSubmit = async (data) => {
    await api.post('/admin/users', {
      name: data.name,
      email: data.email,
      phone: `${data.countryCode}${data.phone}`,
      city: data.city,
      state: data.state,
      password: data.password,
      role: data.role,
    })
    onAdded()
    onClose()
  }

  return (
    <Modal open title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <Input id="name" label="Full name" type="text" required error={errors.name?.message} {...register('name')} />
        <Input id="email" label="Email" type="email" required error={errors.email?.message} {...register('email')} />

        {/* Mobile with country code */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-primary">Mobile number <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select
              {...register('countryCode')}
              className="border border-zinc-200 rounded-lg px-2 py-2 text-sm text-primary outline-none focus:border-zinc-400 bg-white w-28 shrink-0"
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <div className="flex-1">
              <Input id="phone" type="tel" placeholder="9876543210" error={errors.phone?.message} {...register('phone')} />
            </div>
          </div>
          {errors.countryCode && <p className="text-xs text-red-500">{errors.countryCode.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input id="city" label="City" type="text" required error={errors.city?.message} {...register('city')} />
          <Input id="state" label="State" type="text" required error={errors.state?.message} {...register('state')} />
        </div>

        <Input id="password" label="Password" type="password" placeholder="••••••••" required error={errors.password?.message} {...register('password')} />
        <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••" required error={errors.confirm?.message} {...register('confirm')} />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-primary">Role</label>
          <select {...register('role')} className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-zinc-400 bg-white">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

      </form>
      <ModalFooter>
        <Button variant="secondary" className="w-auto px-4" onClick={onClose}>Cancel</Button>
        <Button className="w-auto px-4" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Creating...' : 'Add User'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

function EditModal({ user, onClose }) {
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { name: user.name, email: user.email },
  })

  const onSubmit = async (data) => {
    await dispatch(editUser({ id: user.id, data }))
    onClose()
  }

  return (
    <Modal open title="Edit User" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input id="name" label="Full name" type="text" required error={errors.name?.message} {...register('name')} />
        <Input id="email" label="Email" type="email" required error={errors.email?.message} {...register('email')} />
      </form>
      <ModalFooter>
        <Button variant="secondary" className="w-auto px-4" onClick={onClose}>Cancel</Button>
        <Button className="w-auto px-4" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

function ResetPasswordModal({ user, onClose }) {
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data) => {
    await dispatch(resetUserPassword({ id: user.id, password: data.password }))
    onClose()
  }

  return (
    <Modal open title="Reset Password" onClose={onClose}>
      <p className="text-xs text-secondary mb-4">
        Set a new password for <span className="font-medium text-primary">{user.name}</span>
      </p>
      <div className="flex flex-col gap-4">
        <Input id="password" label="New password" type="password" placeholder="••••••••" required error={errors.password?.message} {...register('password')} />
        <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••" required error={errors.confirm?.message} {...register('confirm')} />
      </div>
      <ModalFooter>
        <Button variant="secondary" className="w-auto px-4" onClick={onClose}>Cancel</Button>
        <Button variant="danger" className="w-auto px-4" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default function AdminUsers() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((state) => state.users)
  const [editTarget, setEditTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)

  useEffect(() => { dispatch(fetchUsers()) }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Users</h1>
          <p className="text-sm text-secondary mt-1">Manage all registered users.</p>
        </div>
        <Button size="sm" className="!w-auto" onClick={() => setShowAddUser(true)}>+ Add User</Button>
      </div>

      <Table>
        <TableHead>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Email</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Joined</TableHeadCell>
          <TableHeadCell />
        </TableHead>
        <TableBody>
          {loading ? (
            <TableLoading />
          ) : error ? (
            <TableEmpty message={error} icon="⚠️" />
          ) : list.length === 0 ? (
            <TableEmpty message="No users found" icon="👥" />
          ) : (
            list.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-primary">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isVerified ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-secondary'}`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </TableCell>
                <TableCell className="text-secondary text-xs">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 justify-end">
                    <button onClick={() => setEditTarget(user)} className="text-xs text-secondary hover:text-primary transition-colors">Edit</button>
                    <button onClick={() => setResetTarget(user)} className="text-xs text-secondary hover:text-red-500 transition-colors">Reset pwd</button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onAdded={() => dispatch(fetchUsers())} />}
      {editTarget && <EditModal user={editTarget} onClose={() => setEditTarget(null)} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
    </div>
  )
}
