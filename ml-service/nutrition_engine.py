from typing import Dict, List
from datetime import datetime

class NutritionRecommender:
    """
    AI-powered nutrition recommendation engine based on occupation, health data, and gender.
    Provides personalized meal plans, snacks, and hydration recommendations.
    """
    
    def __init__(self):
        # Occupation-based caloric needs and stress patterns
        self.occupation_profiles = {
            'Software Engineer': {
                'activity_level': 'sedentary',
                'stress_pattern': 'high',
                'calorie_multiplier': 1.2,
                'concerns': ['eye strain', 'posture', 'sedentary lifestyle']
            },
            'Driver': {
                'activity_level': 'light',
                'stress_pattern': 'moderate',
                'calorie_multiplier': 1.4,
                'concerns': ['circulation', 'back pain', 'irregular meals']
            },
            'Teacher': {
                'activity_level': 'moderate',
                'stress_pattern': 'moderate-high',
                'calorie_multiplier': 1.5,
                'concerns': ['vocal strain', 'standing fatigue', 'mental exhaustion']
            },
            'Doctor': {
                'activity_level': 'active',
                'stress_pattern': 'very high',
                'calorie_multiplier': 1.6,
                'concerns': ['irregular schedule', 'high stress', 'long hours']
            },
            'Nurse': {
                'activity_level': 'very active',
                'stress_pattern': 'high',
                'calorie_multiplier': 1.7,
                'concerns': ['physical strain', 'shift work', 'emotional stress']
            },
            'Construction Worker': {
                'activity_level': 'very active',
                'stress_pattern': 'moderate',
                'calorie_multiplier': 1.9,
                'concerns': ['physical labor', 'outdoor conditions', 'injury risk']
            },
            'Chef': {
                'activity_level': 'active',
                'stress_pattern': 'high',
                'calorie_multiplier': 1.6,
                'concerns': ['standing fatigue', 'heat exposure', 'irregular eating']
            }
        }
    
    def generate_recommendations(self, data: Dict) -> Dict:
        """Generate comprehensive nutrition recommendations"""
        
        occupation = data.get('occupation', 'Other')
        gender = data.get('gender', 'Other')
        age = data.get('age', 30)
        weight = data.get('weight', 70)
        height = data.get('height', 170)
        stress_level = data.get('stressLevel', 5)
        heart_rate = data.get('heartRate', 75)
        diet_type = data.get('dietType', 'Non-Vegetarian')
        health_conditions = data.get('healthConditions', [])
        
        age_group = self._get_age_group(age)
        
        # Calculate daily caloric needs (strictly age-based)
        daily_calories = self._calculate_caloric_needs(age)
        
        # Generate meal plans for 7 days
        meal_plans = self._generate_weekly_meal_plan(
            occupation,
            gender,
            age_group,
            daily_calories,
            diet_type,
            health_conditions,
            stress_level,
            heart_rate
        )
        
        # Generate healthy snack recommendations
        snacks = self._generate_snack_recommendations(
            occupation,
            gender,
            age_group,
            stress_level,
            diet_type,
            health_conditions
        )
        
        # Generate healthy drink alternatives
        drinks = self._generate_drink_recommendations(
            occupation,
            gender,
            age_group,
            stress_level,
            health_conditions
        )
        
        # Hydration reminders
        hydration_plan = self._generate_hydration_plan(occupation, weight)
        
        # Occupation-specific advice
        occupation_advice = self._generate_occupation_advice(occupation, stress_level, gender)
        
        return {
            'dailyCalorieTarget': daily_calories,
            'mealPlans': meal_plans,
            'healthySnacks': snacks,
            'healthyDrinks': drinks,
            'hydrationPlan': hydration_plan,
            'occupationAdvice': occupation_advice
        }
    
    def _get_age_group(self, age: int) -> str:
        if age <= 12:
            return 'child'
        if age <= 19:
            return 'teen'
        if age >= 60:
            return 'elderly'
        return 'adult'

    def _calculate_caloric_needs(self, age: int) -> int:
        """Strict age-based daily calorie target."""
        age_group = self._get_age_group(age)
        if age_group == 'teen':
            return 2400
        if age_group == 'child':
            return 1800
        if age_group == 'elderly':
            return 1700
        return 2000
    
    def _generate_weekly_meal_plan(self, occupation: str, gender: str, age_group: str, calories: int,
                                     diet_type: str, health_conditions: List, 
                                     stress_level: int, heart_rate: int) -> List[Dict]:
        """Generate personalized 7-day meal plan (dynamic by week)."""
        
        is_veg = diet_type in ['Vegetarian', 'Vegan']
        has_diabetes = 'Diabetes' in health_conditions
        has_hypertension = 'Hypertension' in health_conditions
        week_offset = self._get_week_offset()
        preference_tags = self._build_preference_tags(
            age_group, gender, occupation, stress_level, health_conditions, heart_rate
        )
        
        # Distribute calories across meals
        breakfast_cal = int(calories * 0.25)
        lunch_cal = int(calories * 0.35)
        dinner_cal = int(calories * 0.30)
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        meal_plans = []
        
        for i, day in enumerate(days):
            breakfast = self._get_breakfast_option(
                i, week_offset, preference_tags, is_veg, breakfast_cal, has_diabetes
            )
            lunch = self._get_lunch_option(
                i, week_offset, preference_tags, is_veg, lunch_cal, has_diabetes, has_hypertension
            )
            dinner = self._get_dinner_option(
                i, week_offset, preference_tags, is_veg, dinner_cal, has_diabetes, has_hypertension
            )
            
            meal_plans.append({
                'day': day,
                'breakfast': breakfast,
                'lunch': lunch,
                'dinner': dinner,
                'totalCalories': breakfast['calories'] + lunch['calories'] + dinner['calories']
            })
        
        return meal_plans

    def _get_week_offset(self) -> int:
        return datetime.now().isocalendar()[1]

    def _build_preference_tags(self, age_group: str, gender: str, occupation: str,
                               stress_level: int, health_conditions: List, heart_rate: int) -> List[str]:
        tags = ['easy', 'budget', 'quick']
        profile = self.occupation_profiles.get(occupation, {})
        activity = profile.get('activity_level', 'moderate')
        
        if age_group == 'child':
            tags.append('kid_friendly')
        elif age_group == 'teen':
            tags.append('high_energy')
        elif age_group == 'elderly':
            tags.append('light')
        else:
            tags.append('balanced')
        
        if activity in ['active', 'very active']:
            tags.append('high_energy')
        elif activity in ['sedentary']:
            tags.append('light')
        
        if stress_level > 6:
            tags.append('calming')
        if heart_rate > 95:
            tags.append('heart_healthy')
        if 'Diabetes' in health_conditions:
            tags.append('low_sugar')
        if 'Hypertension' in health_conditions:
            tags.append('low_sodium')
        
        return tags

    def _select_option(self, options: List[Dict], day_index: int, week_offset: int, preferred_tags: List[str]) -> Dict:
        def score(option: Dict) -> int:
            return len(set(option.get('tags', [])) & set(preferred_tags))
        
        scored = sorted(options, key=score, reverse=True)
        if not scored:
            return options[day_index % len(options)]
        idx = (day_index + week_offset) % len(scored)
        return scored[idx]

    def _select_top_items(self, options: List[Dict], preferred_tags: List[str], limit: int) -> List[Dict]:
        def score(option: Dict) -> int:
            return len(set(option.get('tags', [])) & set(preferred_tags))
        scored = sorted(options, key=score, reverse=True)
        return scored[:limit] if len(scored) > limit else scored

    def _infer_tags(self, name: str) -> List[str]:
        lowered = name.lower()
        tags = []
        if 'oat' in lowered or 'whole grain' in lowered or 'quinoa' in lowered:
            tags.append('low_sugar')
        if 'salad' in lowered or 'vegetable' in lowered or 'greens' in lowered:
            tags.append('heart_healthy')
        if 'soup' in lowered or 'khichdi' in lowered:
            tags.append('light')
        if 'smoothie' in lowered or 'pancake' in lowered:
            tags.append('high_energy')
        if 'yogurt' in lowered or 'milk' in lowered:
            tags.append('calming')
        return tags

    def _apply_meal_defaults(self, option: Dict, meal_type: str) -> Dict:
        defaults = {
            'breakfast': '7:00–9:00 AM',
            'lunch': '12:30–2:00 PM',
            'dinner': '7:00–8:30 PM'
        }
        option.setdefault('bestTime', defaults.get(meal_type, 'Anytime'))
        base_tags = set(option.get('tags', []))
        base_tags.update(['easy', 'budget', 'quick'])
        base_tags.update(self._infer_tags(option.get('name', '')))
        option['tags'] = list(base_tags)
        return option
    
    def _get_breakfast_option(self, day_index: int, week_offset: int, preference_tags: List[str],
                                is_veg: bool, target_cal: int, has_diabetes: bool) -> Dict:
        """Get breakfast option for the day"""
        
        veg_options = [
            {
                'name': 'Oatmeal with Berries & Almonds',
                'calories': target_cal,
                'description': 'Steel-cut oats (60g), mixed berries (100g), almonds (15g), honey (1 tsp)',
                'benefits': 'High fiber, antioxidants, heart-healthy fats',
                'protein': '12g', 'carbs': '45g', 'fats': '10g'
            },
            {
                'name': 'Whole Grain Toast with Avocado & Poached Eggs',
                'calories': target_cal,
                'description': 'Whole grain bread (2 slices), avocado (½), eggs (2), cherry tomatoes',
                'benefits': 'Protein-rich, healthy fats, sustained energy',
                'protein': '18g', 'carbs': '35g', 'fats': '15g'
            },
            {
                'name': 'Greek Yogurt Parfait with Granola',
                'calories': target_cal,
                'description': 'Greek yogurt (200g), homemade granola (40g), honey, mixed fruits',
                'benefits': 'Probiotics, protein, digestive health',
                'protein': '20g', 'carbs': '40g', 'fats': '8g'
            },
            {
                'name': 'Vegetable Upma with Peanuts',
                'calories': target_cal,
                'description': 'Semolina (60g), mixed vegetables, peanuts (20g), curry leaves',
                'benefits': 'Balanced nutrition, Indian comfort food',
                'protein': '10g', 'carbs': '48g', 'fats': '12g'
            },
            {
                'name': 'Smoothie Bowl with Seeds & Fruits',
                'calories': target_cal,
                'description': 'Banana, berries, spinach, chia seeds, flax seeds, almond milk',
                'benefits': 'Nutrient-dense, omega-3 fatty acids',
                'protein': '8g', 'carbs': '42g', 'fats': '10g'
            },
            {
                'name': 'Whole Wheat Pancakes with Fresh Fruits',
                'calories': target_cal,
                'description': 'Whole wheat flour (80g), eggs, milk, topped with berries & maple syrup',
                'benefits': 'Fiber-rich, satisfying, energizing',
                'protein': '14g', 'carbs': '50g', 'fats': '8g'
            },
            {
                'name': 'Moong Dal Chilla with Mint Chutney',
                'calories': target_cal,
                'description': 'Moong dal (70g), vegetables, spices, mint chutney',
                'benefits': 'High protein, low glycemic index',
                'protein': '16g', 'carbs': '38g', 'fats': '6g'
            }
        ]
        
        non_veg_options = veg_options + [
            {
                'name': 'Scrambled Eggs with Whole Grain Toast & Turkey',
                'calories': target_cal,
                'description': 'Eggs (3), turkey slices (50g), whole grain bread, vegetables',
                'benefits': 'High protein, lean meat, sustained energy',
                'protein': '28g', 'carbs': '32g', 'fats': '12g'
            }
        ]
        
        options = veg_options if is_veg else non_veg_options
        options = [self._apply_meal_defaults(option, 'breakfast') for option in options]
        return self._select_option(options, day_index, week_offset, preference_tags)
    
    def _get_lunch_option(self, day_index: int, week_offset: int, preference_tags: List[str],
                           is_veg: bool, target_cal: int, has_diabetes: bool, has_hypertension: bool) -> Dict:
        """Get lunch option for the day"""
        
        veg_options = [
            {
                'name': 'Quinoa Bowl with Roasted Vegetables',
                'calories': target_cal,
                'description': 'Quinoa (100g), roasted vegetables, chickpeas (80g), tahini dressing',
                'benefits': 'Complete protein, fiber-rich, antioxidants',
                'protein': '18g', 'carbs': '55g', 'fats': '14g'
            },
            {
                'name': 'Brown Rice with Dal & Vegetable Curry',
                'calories': target_cal,
                'description': 'Brown rice (120g), mixed dal (100g), seasonal vegetable curry, salad',
                'benefits': 'Balanced Indian meal, fiber, protein',
                'protein': '20g', 'carbs': '62g', 'fats': '10g'
            },
            {
                'name': 'Whole Wheat Pasta with Mediterranean Vegetables',
                'calories': target_cal,
                'description': 'Whole wheat pasta (100g), tomatoes, olives, bell peppers, feta cheese',
                'benefits': 'Heart-healthy, Mediterranean diet',
                'protein': '16g', 'carbs': '58g', 'fats': '12g'
            },
            {
                'name': 'Lentil Soup with Multigrain Bread & Salad',
                'calories': target_cal,
                'description': 'Lentil soup (300ml), multigrain bread (2 slices), mixed green salad',
                'benefits': 'High fiber, protein, vitamins',
                'protein': '18g', 'carbs': '54g', 'fats': '8g'
            },
            {
                'name': 'Paneer Tikka with Roti & Raita',
                'calories': target_cal,
                'description': 'Paneer tikka (150g), whole wheat roti (2), cucumber raita, salad',
                'benefits': 'Protein-rich, probiotics, calcium',
                'protein': '24g', 'carbs': '48g', 'fats': '16g'
            },
            {
                'name': 'Buddha Bowl with Sweet Potato & Hummus',
                'calories': target_cal,
                'description': 'Sweet potato, quinoa, chickpeas, avocado, hummus, greens',
                'benefits': 'Nutrient-dense, balanced macros',
                'protein': '16g', 'carbs': '60g', 'fats': '14g'
            },
            {
                'name': 'Vegetable Biryani with Raita',
                'calories': target_cal,
                'description': 'Brown rice biryani (180g), mixed vegetables, raita, salad',
                'benefits': 'Aromatic, satisfying, balanced',
                'protein': '14g', 'carbs': '64g', 'fats': '10g'
            }
        ]
        
        non_veg_options = veg_options + [
            {
                'name': 'Grilled Chicken Breast with Quinoa & Steamed Broccoli',
                'calories': target_cal,
                'description': 'Chicken breast (150g), quinoa (100g), steamed broccoli, olive oil',
                'benefits': 'High protein, lean, nutrient-dense',
                'protein': '42g', 'carbs': '50g', 'fats': '12g'
            },
            {
                'name': 'Salmon with Brown Rice & Asian Vegetables',
                'calories': target_cal,
                'description': 'Grilled salmon (140g), brown rice (100g), stir-fried vegetables',
                'benefits': 'Omega-3 fatty acids, brain health',
                'protein': '38g', 'carbs': '52g', 'fats': '16g'
            }
        ]
        
        options = veg_options if is_veg else non_veg_options
        options = [self._apply_meal_defaults(option, 'lunch') for option in options]
        selected = self._select_option(options, day_index, week_offset, preference_tags)
        if has_hypertension:
            selected['note'] = 'Prepared with minimal salt, herbs for flavor'
        return selected
    
    def _get_dinner_option(self, day_index: int, week_offset: int, preference_tags: List[str],
                            is_veg: bool, target_cal: int, has_diabetes: bool, has_hypertension: bool) -> Dict:
        """Get dinner option for the day"""
        
        veg_options = [
            {
                'name': 'Grilled Tofu Stir-fry with Brown Rice',
                'calories': target_cal,
                'description': 'Tofu (150g), mixed vegetables, brown rice (100g), ginger-garlic sauce',
                'benefits': 'Plant protein, low fat, satisfying',
                'protein': '20g', 'carbs': '48g', 'fats': '10g'
            },
            {
                'name': 'Mixed Dal with Roti & Sautéed Greens',
                'calories': target_cal,
                'description': 'Mixed dal (150g), whole wheat roti (2), spinach/kale, tomatoes',
                'benefits': 'Light yet nutritious, easy to digest',
                'protein': '18g', 'carbs': '52g', 'fats': '8g'
            },
            {
                'name': 'Stuffed Bell Peppers with Quinoa',
                'calories': target_cal,
                'description': 'Bell peppers stuffed with quinoa, black beans, corn, cheese',
                'benefits': 'Colorful, nutritious, complete meal',
                'protein': '16g', 'carbs': '50g', 'fats': '12g'
            },
            {
                'name': 'Vegetable Khichdi with Yogurt',
                'calories': target_cal,
                'description': 'Rice-dal khichdi (200g), vegetables, ghee (1 tsp), yogurt',
                'benefits': 'Comfort food, easy digestion, balanced',
                'protein': '14g', 'carbs': '54g', 'fats': '10g'
            },
            {
                'name': 'Chickpea Curry with Quinoa',
                'calories': target_cal,
                'description': 'Chickpea curry (180g), quinoa (80g), mixed salad',
                'benefits': 'High protein, fiber, iron',
                'protein': '18g', 'carbs': '56g', 'fats': '10g'
            },
            {
                'name': 'Palak Paneer with Roti',
                'calories': target_cal,
                'description': 'Palak paneer (200g), whole wheat roti (2), cucumber salad',
                'benefits': 'Iron-rich, calcium, protein',
                'protein': '22g', 'carbs': '46g', 'fats': '14g'
            },
            {
                'name': 'Vegetable Soup & Whole Grain Sandwich',
                'calories': target_cal,
                'description': 'Mixed vegetable soup (300ml), whole grain sandwich with hummus & veggies',
                'benefits': 'Light, warming, nutritious',
                'protein': '12g', 'carbs': '48g', 'fats': '10g'
            }
        ]
        
        non_veg_options = veg_options + [
            {
                'name': 'Baked Fish with Sweet Potato & Asparagus',
                'calories': target_cal,
                'description': 'Baked fish (150g), roasted sweet potato (150g), asparagus',
                'benefits': 'Omega-3, complex carbs, fiber',
                'protein': '36g', 'carbs': '45g', 'fats': '12g'
            },
            {
                'name': 'Chicken Stir-fry with Brown Rice',
                'calories': target_cal,
                'description': 'Chicken breast (130g), mixed vegetables, brown rice (80g)',
                'benefits': 'Lean protein, balanced, flavorful',
                'protein': '38g', 'carbs': '48g', 'fats': '10g'
            }
        ]
        
        options = veg_options if is_veg else non_veg_options
        options = [self._apply_meal_defaults(option, 'dinner') for option in options]
        return self._select_option(options, day_index, week_offset, preference_tags)
    
    def _generate_snack_recommendations(self, occupation: str, gender: str, age_group: str,
                                         stress_level: int, diet_type: str, health_conditions: List) -> List[Dict]:
        """Generate healthy snack recommendations"""
        
        is_veg = diet_type in ['Vegetarian', 'Vegan']
        preferred_tags = self._build_preference_tags(age_group, gender, occupation, stress_level, health_conditions, 70)
        
        snacks = [
            {
                'name': 'Mixed Nuts & Seeds',
                'calories': 180,
                'description': 'Almonds, walnuts, pumpkin seeds (30g)',
                'benefits': 'Healthy fats, protein, brain health',
                'bestTime': 'Mid-morning',
                'bestTimeCategory': 'Best for Morning',
                'tags': ['balanced', 'high_energy']
            },
            {
                'name': 'Greek Yogurt with Berries',
                'calories': 150,
                'description': 'Plain Greek yogurt (150g), fresh berries (50g)',
                'benefits': 'Protein, probiotics, antioxidants',
                'bestTime': 'Afternoon',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['calming', 'low_sugar']
            },
            {
                'name': 'Apple Slices with Almond Butter',
                'calories': 170,
                'description': 'Apple (1 medium), almond butter (1 tbsp)',
                'benefits': 'Fiber, healthy fats, satisfying',
                'bestTime': 'Morning',
                'bestTimeCategory': 'Best for Morning',
                'tags': ['balanced', 'low_sugar']
            },
            {
                'name': 'Roasted Chickpeas',
                'calories': 140,
                'description': 'Roasted chickpeas (50g), spiced',
                'benefits': 'Protein, fiber, crunchy',
                'bestTime': 'Evening',
                'bestTimeCategory': 'Best for Evening',
                'tags': ['high_energy']
            },
            {
                'name': 'Dark Chocolate & Almonds',
                'calories': 160,
                'description': 'Dark chocolate (20g, 70%+), almonds (15g)',
                'benefits': 'Antioxidants, mood booster, heart-healthy',
                'bestTime': 'Post-lunch',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['calming', 'heart_healthy']
            },
            {
                'name': 'Vegetable Sticks with Hummus',
                'calories': 120,
                'description': 'Carrot, cucumber, bell pepper with hummus (50g)',
                'benefits': 'Low calorie, vitamins, filling',
                'bestTime': 'Anytime',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['light', 'heart_healthy']
            },
            {
                'name': 'Boiled Eggs',
                'calories': 140,
                'description': '2 boiled eggs with a pinch of salt & pepper',
                'benefits': 'High protein, portable, filling',
                'bestTime': 'Morning',
                'bestTimeCategory': 'Best for Morning',
                'tags': ['high_energy']
            },
            {
                'name': 'Protein Energy Balls',
                'calories': 150,
                'description': 'Dates, oats, peanut butter, chia seeds (2 balls)',
                'benefits': 'Natural energy, no added sugar',
                'bestTime': 'Pre-workout',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['high_energy', 'low_sugar']
            }
        ]
        
        # Filter based on diet
        if is_veg or 'Vegan' in diet_type:
            snacks = [s for s in snacks if 'egg' not in s['name'].lower()]
        return self._select_top_items(snacks, preferred_tags, limit=6)
    
    def _generate_drink_recommendations(self, occupation: str, gender: str, age_group: str,
                                         stress_level: int, health_conditions: List) -> List[Dict]:
        """Generate healthy drink recommendations"""
        
        preferred_tags = self._build_preference_tags(age_group, gender, occupation, stress_level, health_conditions, 70)
        drinks = [
            {
                'name': 'Green Tea',
                'calories': 2,
                'description': 'Freshly brewed green tea with lemon',
                'benefits': 'Antioxidants, metabolism boost, calm focus',
                'servings': '2-3 cups daily',
                'bestTime': 'Morning',
                'bestTimeCategory': 'Best for Morning',
                'tags': ['calming', 'heart_healthy']
            },
            {
                'name': 'Coconut Water',
                'calories': 45,
                'description': 'Fresh coconut water',
                'benefits': 'Natural electrolytes, hydration, minerals',
                'servings': '1-2 glasses daily',
                'bestTime': 'Afternoon',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['high_energy']
            },
            {
                'name': 'Fresh Fruit Smoothie',
                'calories': 180,
                'description': 'Banana, berries, spinach, almond milk',
                'benefits': 'Vitamins, fiber, natural sweetness',
                'servings': '1 glass daily',
                'bestTime': 'Morning',
                'bestTimeCategory': 'Best for Morning',
                'tags': ['high_energy']
            },
            {
                'name': 'Herbal Tea (Chamomile/Peppermint)',
                'calories': 0,
                'description': 'Caffeine-free herbal tea',
                'benefits': 'Relaxation, digestion, stress relief',
                'servings': '1-2 cups daily, especially evening',
                'bestTime': 'Night',
                'bestTimeCategory': 'Best for Night',
                'tags': ['calming', 'light']
            },
            {
                'name': 'Fresh Lime Water',
                'calories': 20,
                'description': 'Water with fresh lime juice, mint',
                'benefits': 'Vitamin C, refreshing, alkalizing',
                'servings': '2-3 glasses daily',
                'bestTime': 'Anytime',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['heart_healthy']
            },
            {
                'name': 'Buttermilk (Chaas)',
                'calories': 60,
                'description': 'Low-fat buttermilk with cumin, coriander',
                'benefits': 'Probiotics, cooling, digestion',
                'servings': '1 glass daily',
                'bestTime': 'Afternoon',
                'bestTimeCategory': 'Best for Afternoon',
                'tags': ['calming', 'light']
            },
            {
                'name': 'Beetroot Juice',
                'calories': 70,
                'description': 'Fresh beetroot juice with carrot',
                'benefits': 'Iron, blood health, endurance',
                'servings': '1 small glass daily',
                'bestTime': 'Morning',
                'bestTimeCategory': 'Best for Morning',
                'tags': ['high_energy', 'heart_healthy']
            },
            {
                'name': 'Golden Milk (Turmeric Latte)',
                'calories': 120,
                'description': 'Warm milk with turmeric, honey, black pepper',
                'benefits': 'Anti-inflammatory, immunity, sleep quality',
                'servings': '1 cup before bed',
                'bestTime': 'Night',
                'bestTimeCategory': 'Best for Night',
                'tags': ['calming', 'light']
            }
        ]
        
        if stress_level > 6:
            drinks[0]['recommendation'] = 'Highly recommended for stress management'
            drinks[3]['recommendation'] = 'Perfect for evening relaxation'
        
        return self._select_top_items(drinks, preferred_tags, limit=6)
    
    def _generate_hydration_plan(self, occupation: str, weight: float) -> Dict:
        """Generate personalized hydration plan"""
        
        # Base water intake: 30-35ml per kg body weight
        base_water = int(weight * 0.035)  # liters
        
        # Adjust based on occupation activity level
        profile = self.occupation_profiles.get(occupation, {'activity_level': 'moderate'})
        
        if profile['activity_level'] in ['very active', 'active']:
            base_water += 0.5
        
        return {
            'dailyTargetLiters': round(base_water, 1),
            'dailyTargetGlasses': int(base_water * 4),  # Assuming 250ml glasses
            'reminderIntervalHours': 2,
            'tips': [
                'Drink a glass of water immediately after waking up',
                'Keep a water bottle at your desk/workplace',
                'Drink water 30 minutes before meals',
                'Set phone reminders every 2 hours',
                'Increase intake during exercise or hot weather',
                'Monitor urine color (pale yellow is ideal)'
            ],
            'schedule': [
                {'time': '7:00 AM', 'amount': '500ml', 'note': 'Start your day hydrated'},
                {'time': '9:00 AM', 'amount': '250ml', 'note': 'Mid-morning hydration'},
                {'time': '11:00 AM', 'amount': '250ml', 'note': 'Pre-lunch water'},
                {'time': '1:00 PM', 'amount': '250ml', 'note': 'After lunch'},
                {'time': '3:00 PM', 'amount': '250ml', 'note': 'Afternoon boost'},
                {'time': '5:00 PM', 'amount': '250ml', 'note': 'Evening hydration'},
                {'time': '7:00 PM', 'amount': '250ml', 'note': 'With dinner'},
                {'time': '9:00 PM', 'amount': '250ml', 'note': 'Before bed (optional)'}
            ]
        }
    
    def _generate_occupation_advice(self, occupation: str, stress_level: int, 
                                     gender: str) -> Dict:
        """Generate occupation-specific health and nutrition advice"""
        
        profile = self.occupation_profiles.get(occupation, {
            'concerns': ['work-life balance', 'stress management']
        })
        
        advice = {
            'occupationConcerns': profile.get('concerns', []),
            'recommendations': [],
            'genderSpecificAdvice': []
        }
        
        # Occupation-specific recommendations
        if occupation == 'Software Engineer':
            advice['recommendations'] = [
                'Take regular breaks every hour to reduce eye strain',
                'Practice the 20-20-20 rule: every 20 mins, look 20 feet away for 20 seconds',
                'Ensure ergonomic workspace setup',
                'Include omega-3 rich foods for brain health',
                'Stay active with regular stretching and walking'
            ]
        elif occupation == 'Driver':
            advice['recommendations'] = [
                'Pack healthy snacks to avoid fast food temptation',
                'Do simple stretches during breaks',
                'Stay hydrated throughout the day',
                'Maintain good posture while driving',
                'Plan meal times despite irregular schedule'
            ]
        elif occupation == 'Teacher':
            advice['recommendations'] = [
                'Stay hydrated to maintain vocal health',
                'Wear comfortable shoes for standing',
                'Practice stress management techniques',
                'Eat energy-sustaining foods before teaching',
                'Take short mental breaks between classes'
            ]
        elif occupation in ['Doctor', 'Nurse']:
            advice['recommendations'] = [
                'Pack nutritious meals for long shifts',
                'Prioritize sleep quality despite irregular hours',
                'High-protein snacks for sustained energy',
                'Stress management is crucial for this profession',
                'Stay hydrated even during busy periods'
            ]
        elif occupation == 'Construction Worker':
            advice['recommendations'] = [
                'Increase protein intake for muscle recovery',
                'Stay extremely well-hydrated in outdoor conditions',
                'Calorie-dense meals to match energy expenditure',
                'Focus on injury prevention through nutrition',
                'Electrolyte balance is crucial'
            ]
        elif occupation == 'Student':
            advice['recommendations'] = [
                'Maintain regular meal timings to sustain energy',
                'Choose quick, budget-friendly meals with protein',
                'Stay hydrated during long study hours',
                'Limit sugary snacks to avoid energy crashes',
                'Take short movement breaks every hour'
            ]
        elif occupation in ['Manager', 'Accountant', 'Sales Professional']:
            advice['recommendations'] = [
                'Schedule meals during busy work hours to avoid skipping',
                'Choose light, low-oil meals for afternoon productivity',
                'Stay hydrated to reduce fatigue',
                'Include fiber-rich foods to maintain energy levels',
                'Manage stress with brief walks or stretching'
            ]

        if not advice['recommendations']:
            advice['recommendations'] = [
                'Prioritize regular meals and balanced nutrition',
                'Drink water consistently throughout the day',
                'Include vegetables and lean protein in each meal',
                'Limit high-sugar snacks to avoid energy dips',
                'Take short breaks to reduce stress'
            ]
        
        # Gender-specific advice
        if gender == 'Female':
            advice['genderSpecificAdvice'] = [
                'Ensure adequate iron intake (leafy greens, fortified foods)',
                'Include calcium-rich foods for bone health',
                'Maintain consistent meal times for hormonal balance',
                'Stress affects female metabolism differently - prioritize self-care'
            ]
        elif gender == 'Male':
            advice['genderSpecificAdvice'] = [
                'Higher protein requirements for muscle maintenance',
                'Watch sodium intake for heart health',
                'Stress management crucial for cardiovascular health',
                'Maintain healthy weight through balanced nutrition'
            ]
        
        # Stress-level specific advice
        if stress_level > 7:
            advice['stressManagement'] = [
                'Include magnesium-rich foods (spinach, pumpkin seeds, dark chocolate)',
                'B-complex vitamins help with stress (whole grains, eggs)',
                'Avoid excessive caffeine which can increase stress',
                'Consider ashwagandha or chamomile tea',
                'Omega-3 fatty acids support mental health'
            ]
        
        return advice
