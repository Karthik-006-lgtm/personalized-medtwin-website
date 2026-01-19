import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  X, 
  UtensilsCrossed, 
  Coffee, 
  Apple,
  Droplets,
  ChevronRight,
  Loader,
  Briefcase,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NutritionRecommendations = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/predictions/nutrition`);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      toast.error('Failed to load nutrition recommendations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-12">
          <Loader className="animate-spin text-primary-600 mx-auto" size={48} />
          <p className="text-gray-600 mt-4">Generating personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const currentMealPlan = recommendations.mealPlans[activeDay];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed size={32} />
            <div>
              <h2 className="text-2xl font-bold">AI Nutrition Recommendations</h2>
              <p className="text-orange-100">Personalized for your occupation and health</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Daily Calorie Target */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border-2 border-primary-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Daily Calorie Target</h3>
            <p className="text-4xl font-bold text-primary-600">
              {recommendations.dailyCalorieTarget} <span className="text-xl text-gray-600">kcal/day</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">Based on your profile and activity level</p>
          </div>

          {/* Occupation Advice */}
          {recommendations.occupationAdvice && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="text-purple-600" />
                Occupation-Specific Advice
              </h3>
              
              {recommendations.occupationAdvice.occupationConcerns && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-700 mb-2">Key Concerns:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.occupationAdvice.occupationConcerns.map((concern, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.occupationAdvice.recommendations && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-700 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {recommendations.occupationAdvice.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <ChevronRight className="text-purple-600 mt-1 flex-shrink-0" size={16} />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.occupationAdvice.genderSpecificAdvice && recommendations.occupationAdvice.genderSpecificAdvice.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Gender-Specific Advice:</p>
                  <ul className="space-y-1">
                    {recommendations.occupationAdvice.genderSpecificAdvice.map((advice, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <ChevronRight className="text-purple-600 mt-1 flex-shrink-0" size={16} />
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Weekly Meal Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-primary-600" />
              7-Day Meal Plan
            </h3>

            {/* Day Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {recommendations.mealPlans.map((plan, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    activeDay === idx
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {plan.day}
                </button>
              ))}
            </div>

            {/* Meal Details */}
            <div className="space-y-6">
              {/* Breakfast */}
              <MealCard
                title="Breakfast"
                icon="🌅"
                meal={currentMealPlan.breakfast}
              />

              {/* Lunch */}
              <MealCard
                title="Lunch"
                icon="☀️"
                meal={currentMealPlan.lunch}
              />

              {/* Dinner */}
              <MealCard
                title="Dinner"
                icon="🌙"
                meal={currentMealPlan.dinner}
              />

              {/* Total Calories */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600">Total Daily Calories</p>
                <p className="text-2xl font-bold text-gray-800">{currentMealPlan.totalCalories} kcal</p>
              </div>
            </div>
          </div>

          {/* Healthy Snacks */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Apple className="text-green-600" />
              Healthy Snacks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.healthySnacks.map((snack, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{snack.name}</h4>
                    <span className="text-sm font-semibold text-green-600">{snack.calories} cal</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{snack.description}</p>
                  <p className="text-xs text-green-700 font-medium">✓ {snack.benefits}</p>
                  <p className="text-xs text-gray-500 mt-1">Best time: {snack.bestTime}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Healthy Drinks */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Coffee className="text-blue-600" />
              Healthy Drink Alternatives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.healthyDrinks.map((drink, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{drink.name}</h4>
                    <span className="text-sm font-semibold text-blue-600">{drink.calories} cal</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{drink.description}</p>
                  <p className="text-xs text-blue-700 font-medium">✓ {drink.benefits}</p>
                  <p className="text-xs text-gray-500 mt-1">Servings: {drink.servings}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hydration Plan */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets className="text-blue-600" />
              Hydration Plan
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Daily Target</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.hydrationPlan.dailyTargetLiters}L
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Glasses</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.hydrationPlan.dailyTargetGlasses}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center col-span-2">
                <p className="text-sm text-gray-600">Reminder Every</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.hydrationPlan.reminderIntervalHours} Hours
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-700 mb-3">Hydration Schedule:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {recommendations.hydrationPlan.schedule.map((slot, idx) => (
                  <div key={idx} className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs font-semibold text-blue-600">{slot.time}</p>
                    <p className="text-sm text-gray-700">{slot.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">Hydration Tips:</p>
              <ul className="space-y-1">
                {recommendations.hydrationPlan.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <ChevronRight className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-6 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const MealCard = ({ title, icon, meal }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h4>
      <span className="px-3 py-1 bg-primary-100 text-primary-700 font-semibold rounded-full text-sm">
        {meal.calories} cal
      </span>
    </div>
    
    <h5 className="font-semibold text-gray-800 mb-2">{meal.name}</h5>
    <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
    
    <div className="bg-white rounded-lg p-3 mb-2">
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-gray-500">Protein</p>
          <p className="font-semibold text-gray-800">{meal.protein}</p>
        </div>
        <div>
          <p className="text-gray-500">Carbs</p>
          <p className="font-semibold text-gray-800">{meal.carbs}</p>
        </div>
        <div>
          <p className="text-gray-500">Fats</p>
          <p className="font-semibold text-gray-800">{meal.fats}</p>
        </div>
      </div>
    </div>
    
    <p className="text-xs text-green-700 font-medium">✓ {meal.benefits}</p>
    {meal.note && <p className="text-xs text-amber-700 mt-1">⚠️ {meal.note}</p>}
  </div>
);

export default NutritionRecommendations;
