const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#dfe6dc] bg-[#f5f7f4] px-4 py-4 text-center text-sm text-[#66736a]">
      <p>
        {year} Expense Tracker. Built by{" "}
        <span className="font-medium text-[#315c48]">Kamva Hanisi</span>.
      </p>

      <p className="mt-1">
        Simple budgeting, calm tracking, better money habits.
      </p>
    </footer>
  );
};

export default Footer;
