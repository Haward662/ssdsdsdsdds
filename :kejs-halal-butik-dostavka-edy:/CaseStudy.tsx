import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag,
  Zap,
  BarChart3
} from 'lucide-react';

const CaseStudy: React.FC = () => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      
      {/* Hero Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6 border border-brand-100">
          <TrendingUp className="w-4 h-4" />
          <span>Маркетинг для доставки еды</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          Кейс: <span className="text-brand-600">+183 клиента</span> для доставки еды за месяц
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Как мы помогли «Халяль Бутик» масштабировать продажи без демпинга и бесконечных скидок.
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-4xl font-bold text-slate-900 mb-1">+183</span>
          <span className="text-slate-500 font-medium">Новых клиента</span>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-4xl font-bold text-slate-900 mb-1">78 ₽</span>
          <span className="text-slate-500 font-medium">Стоимость клиента</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-16">
        
        {/* Intro */}
        <section className="prose prose-lg prose-slate max-w-none">
          <p className="lead text-xl text-slate-700">
            Доставка еды <strong>«Халяль Бутик»</strong> обратилась к нам с конкретной и амбициозной задачей: увеличить количество заказов, но при этом избежать «скидочных войн» и стратегии постоянных акций, которая убивает маржинальность.
          </p>
        </section>

        {/* Task & Solution Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Task Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Задача</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Привлечь принципиально новую аудиторию, которая еще не заказывала.</span>
              </li>
              <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Снизить стоимость привлечения заказа (CPO) и удержать её в рамках KPI.</span>
              </li>
            </ul>
          </section>

          {/* Solution Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Что сделали</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600 text-xs font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Таргетированная реклама ВК</h3>
                  <p className="text-slate-600 text-sm mt-1">Настроили точечный таргетинг по гео (районы доставки) и интересам (халяль, здоровая еда).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600 text-xs font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Рассылки по базе</h3>
                  <p className="text-slate-600 text-sm mt-1">Сегментировали текущую базу и запустили персонализированные предложения без глубоких скидок.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600 text-xs font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Возврат ушедших клиентов</h3>
                  <p className="text-slate-600 text-sm mt-1">Реактивация "спящих" клиентов через напоминания о любимых блюдах.</p>
                </div>
              </li>
            </ul>
          </section>

        </div>

        {/* Results Section */}
        <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-8 h-8 text-brand-400" />
              <h2 className="text-3xl font-bold">Итоговые результаты</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-5xl font-bold text-brand-400 mb-2">+183</div>
                <div className="text-xl text-slate-300">Новых подтвержденных клиента</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">78 ₽</div>
                <div className="text-xl text-slate-300">Средняя стоимость привлечения</div>
              </div>
            </div>

            <p className="text-slate-400 max-w-2xl">
              Благодаря комплексному подходу мы не только выполнили план по новым клиентам, но и существенно снизили рекламные издержки, создав базу для повторных продаж.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-brand-50 rounded-2xl p-8 sm:p-10 border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Хотите такие же результаты?</h3>
            <p className="text-slate-600">Оставьте заявку, и мы подготовим стратегию для вашего бизнеса.</p>
          </div>
          <button className="whitespace-nowrap flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/30">
            Обсудить мой проект
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </article>
  );
};

export default CaseStudy;