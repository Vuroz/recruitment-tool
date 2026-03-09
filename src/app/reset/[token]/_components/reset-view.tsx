import type { ResetPasswordValues } from "@/validation/resetPassword";

type ResetPWViewProps = {
    token: string;
    user: {
        name: string | null;
        surname: string | null;
    } | undefined;
    onUpdate: (values: ResetPasswordValues) => void;
};

export default function ResetPWView({ token, user, onUpdate }: ResetPWViewProps) {
    function onSubmitACB(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const confirmation = formData.get("confirmation") as string;

        if (password !== confirmation) {
            alert("Password and confirmation do not match");
            return;
        }

        const values: ResetPasswordValues = {
            token: (typeof token === "string" ? token : ""),
            username: (typeof username === "string" ? username : "").trim(),
            password: (typeof password === "string" ? password : "")
        }

        onUpdate(values);
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 mt-8">
                    <h1 className="text-4xl font-bold mb-6">Hello {user?.name ?? 'there!'}{user?.surname ? ` ${user.surname}!` : ''}</h1>
                    <p className="text-white/60">Please enter a new username and password</p>
                </div>
                <form
                    className="grid grid-cols-[1fr_3fr] gap-4 rounded-xl border border-white/20 bg-white/5 p-6"
                    onSubmit={onSubmitACB}
                >
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" className="bg-white/10 p-2 rounded" />
                    <label htmlFor="password">New Password</label>
                    <input type="text" name="password" id="password" className="bg-white/10 p-2 rounded" />
                    <label htmlFor="confirmation">Confirm password</label>
                    <input type="text" name="confirmation" id="confirmation" className="bg-white/10 p-2 rounded" />
                    <button className="col-span-2 bg-white/10 hover:bg-white/20 cursor-pointer p-2 rounded" type="submit">Update</button>
                </form>
            </div>
        </main>
    )
}