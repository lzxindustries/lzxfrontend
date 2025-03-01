export function AccountDetails({
  firstName = '',
  lastName = '',
  email = '',
  phone = '',
  ...props
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}) {
  return (
    <div className="grid w-full gap-4 p-4 py-6 md:gap-8 md:p-8 lg:p-12">
      <h3 className="font-bold text-lead">Account Details</h3>
      <div className="lg:p-8 p-6 border border-gray-200 rounded">
        <div className="flex">
          <h3 className="font-bold text-base flex-1">Profile & Security</h3>
          <a className="underline text-sm font-normal" href="/account/edit">
            Edit
          </a>
        </div>
        <div className="mt-4 text-sm text-primary/50">Name</div>
        <p className="mt-1">
          {firstName || lastName
            ? (firstName ? firstName + ' ' : '') + lastName
            : 'Add name'}{' '}
        </p>

        <div className="mt-4 text-sm text-primary/50">Contact</div>
        <p className="mt-1">{phone ?? 'Add mobile'}</p>

        <div className="mt-4 text-sm text-primary/50">Email address</div>
        <p className="mt-1">{email}</p>

        <div className="mt-4 text-sm text-primary/50">Password</div>
        <p className="mt-1">**************</p>
      </div>
    </div>
  );
}
