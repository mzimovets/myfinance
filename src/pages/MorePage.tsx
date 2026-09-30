import SalarySettingsCard from '../components/settings/SalarySettingsCard'
import CategoryManager from '../components/settings/CategoryManager'
import BudgetsManager from '../components/settings/BudgetsManager'
import DataManagement from '../components/settings/DataManagement'
import ThemeSwitcher from '../components/settings/ThemeSwitcher'

export default function MorePage() {
  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Ещё</h1>
      </header>
      <SalarySettingsCard />
      <BudgetsManager />
      <CategoryManager />
      <ThemeSwitcher />
      <DataManagement />
      <p className="text-center text-[11px] text-slate-400 pb-4">Мои финансы · Все данные хранятся локально на устройстве</p>
    </div>
  )
}
