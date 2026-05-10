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

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

const resetSchema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

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

  useEffect(() => { dispatch(fetchUsers()) }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-primary tracking-tight">Users</h1>
        <p className="text-sm text-secondary mt-1">Manage all registered users.</p>
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

      {editTarget && <EditModal user={editTarget} onClose={() => setEditTarget(null)} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
    </div>
  )
}
