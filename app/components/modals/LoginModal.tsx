'use client'
import { signIn } from 'next-auth/react'
import { AiOutlineGithub } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import { useState, useCallback } from 'react'
import { SubmitHandler, useForm, FieldValues } from 'react-hook-form'
import useLoginModal from '../../hooks/useLoginModal'
import Modal from './Modal'
import Heading from '../Heading'
import Input from '../inputs/Input'
import toast from 'react-hot-toast'
import Button from '../Button'
import { useRouter } from 'next/navigation'
import useRegisterModal from '@/app/hooks/useRegisterModal'

const LoginModal = () => {
	const loginModal = useLoginModal()
	const registerModal = useRegisterModal()
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FieldValues>({
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit: SubmitHandler<FieldValues> = (data) => {
		setIsLoading(true)

		signIn('credentials', {
			...data,
			redirect: false,
		}).then((callback) => {
			setIsLoading(false)

			if (callback?.error) {
				toast.error('Error: ' + callback.error)
			} else if (callback?.ok) {
				toast.success('Login successful')
				router.refresh()
				loginModal.onClose()
			}
		})
	}
	const bodyContent = (
		<div className="flex flex-col gap-4">
			<Heading title="Welcome back" subtitle="Login to your account!" />
			<Input
				register={register}
				id="email"
				label="Email"
				disabled={isLoading}
				errors={errors}
				required
			/>
			<Input
				register={register}
				id="password"
				label="Password"
				type="password"
				disabled={isLoading}
				errors={errors}
				required
			/>
		</div>
	)

	const footerContent = (
		<div className="flex flex-col gap-4 mt-3">
			<hr />
			<Button
				onClick={() => signIn('google')}
				outline
				label="Continue with Google"
				icon={FcGoogle}
			/>
			<Button
				onClick={() => signIn('github')}
				outline
				label="Continue with GitHub"
				icon={AiOutlineGithub}
			/>
			<div className="text-neutral-500 text-center mt-4 font-light">
				<div className="justify-center flex flex-row items-center gap-2">
					<div>Don&apos;t have account?</div>
					<div
						onClick={() => {
							loginModal.onClose()
							registerModal.onOpen()
						}}
						className="text-neutral-800 cursor-pointer hover:underline"
					>
						Register
					</div>
				</div>
			</div>
		</div>
	)

	return (
		<Modal
			disabled={isLoading}
			isOpen={loginModal.isOpen}
			title="Login"
			actionLabel="Continue"
			onClose={loginModal.onClose}
			onSubmit={handleSubmit(onSubmit)}
			body={bodyContent}
			footer={footerContent}
		/>
	)
}

export default LoginModal
