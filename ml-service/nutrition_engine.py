from typing import Dict, List

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
        
        # Calculate daily caloric needs
        daily_calories = self._calculate_caloric_needs(gender, age, weight, height, occupation)
        
        # Generate meal plans for 7 days
        meal_plans = self._generate_weekly_meal_plan(
            occupation, gender, daily_calories, diet_type, health_conditions, stress_level
        )
        
        # Generate healthy snack recommendations
        snacks = self._generate_snack_recommendations(
            occupation, stress_level, diet_type, health_conditions
        )
        
        # Generate healthy drink alternatives
        drinks = self._generate_drink_recommendations(
            occupation, stress_level, health_conditions
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
    
    def _calculate_caloric_needs(self, gender: str, age: int, weight: float, 
                                   height: float, occupation: str) -> int:
        """Calculate daily caloric needs using Harris-Benedict equation"""
        
        # Base Metabolic Rate (BMR)
        if gender == 'Male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:  # Female or Other
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        # Apply occupation activity multiplier
        profile = self.occupation_profiles.get(occupation, {'calorie_multiplier': 1.5})
        daily_calories = int(bmr * profile['calorie_multiplier'])
        
        return daily_calories
    
    def _generate_weekly_meal_plan(self, occupation: str, gender: str, calories: int,
                                     diet_type: str, health_conditions: List, 
                                     stress_level: int) -> List[Dict]:
        """Generate personalized 7-day meal plan"""
        
        is_veg = diet_type in ['Vegetarian', 'Vegan']
        has_diabetes = 'Diabetes' in health_conditions
        has_hypertension = 'Hypertension' in health_conditions
        
        # Distribute calories across meals
        breakfast_cal = int(calories * 0.25)
        lunch_cal = int(calories * 0.35)
        dinner_cal = int(calories * 0.30)
        snack_cal = int(calories * 0.10)
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        meal_plans = []
        
        for i, day in enumerate(days):
            # Rotate through different meal options
            breakfast = self._get_breakfast_option(i, is_veg, breakfast_cal, has_diabetes)
            lunch = self._get_lunch_option(i, is_veg, lunch_cal, has_diabetes, has_hypertension)
            dinner = self._get_dinner_option(i, is_veg, dinner_cal, has_diabetes, has_hypertension)
            
            meal_plans.append({
                'day': day,
                'breakfast': breakfast,
                'lunch': lunch,
                'dinner': dinner,
                'totalCalories': breakfast['calories'] + lunch['calories'] + dinner['calories']
            })
        
        return meal_plans
    
    def _get_breakfast_option(self, day: int, is_veg: bool, target_cal: int, 
                                has_diabetes: bool) -> Dict:
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
        
        if has_diabetes:
            # Prefer lower glycemic options
            return options[day % len([o for o in options if 'low glycemic' in o.get('benefits', '').lower() or day % 2 == 0])]
        
        return options[day % len(options)]
    
    def _get_lunch_option(self, day: int, is_veg: bool, target_cal: int,
                           has_diabetes: bool, has_hypertension: bool) -> Dict:
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
        
        if has_hypertension:
            # Ensure low sodium options are prioritized
            selected = options[day % len(options)]
            selected['note'] = 'Prepared with minimal salt, herbs for flavor'
            return selected
        
        return options[day % len(options)]
    
    def _get_dinner_option(self, day: int, is_veg: bool, target_cal: int,
                            has_diabetes: bool, has_hypertension: bool) -> Dict:
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
        return options[day % len(options)]
    
    def _generate_snack_recommendations(self, occupation: str, stress_level: int,
                                         diet_type: str, health_conditions: List) -> List[Dict]:
        """Generate healthy snack recommendations"""
        
        is_veg = diet_type in ['Vegetarian', 'Vegan']
        has_diabetes = 'Diabetes' in health_conditions
        
        snacks = [
            {
                'name': 'Mixed Nuts & Seeds',
                'calories': 180,
                'description': 'Almonds, walnuts, pumpkin seeds (30g)',
                'benefits': 'Healthy fats, protein, brain health',
                'bestTime': 'Mid-morning or afternoon'
            },
            {
                'name': 'Greek Yogurt with Berries',
                'calories': 150,
                'description': 'Plain Greek yogurt (150g), fresh berries (50g)',
                'benefits': 'Protein, probiotics, antioxidants',
                'bestTime': 'Afternoon'
            },
            {
                'name': 'Apple Slices with Almond Butter',
                'calories': 170,
                'description': 'Apple (1 medium), almond butter (1 tbsp)',
                'benefits': 'Fiber, healthy fats, satisfying',
                'bestTime': 'Morning or afternoon'
            },
            {
                'name': 'Roasted Chickpeas',
                'calories': 140,
                'description': 'Roasted chickpeas (50g), spiced',
                'benefits': 'Protein, fiber, crunchy',
                'bestTime': 'Evening'
            },
            {
                'name': 'Dark Chocolate & Almonds',
                'calories': 160,
                'description': 'Dark chocolate (20g, 70%+), almonds (15g)',
                'benefits': 'Antioxidants, mood booster, heart-healthy',
                'bestTime': 'Post-lunch or evening'
            },
            {
                'name': 'Vegetable Sticks with Hummus',
                'calories': 120,
                'description': 'Carrot, cucumber, bell pepper with hummus (50g)',
                'benefits': 'Low calorie, vitamins, filling',
                'bestTime': 'Anytime'
            },
            {
                'name': 'Boiled Eggs',
                'calories': 140,
                'description': '2 boiled eggs with a pinch of salt & pepper',
                'benefits': 'High protein, portable, filling',
                'bestTime': 'Morning or post-workout'
            },
            {
                'name': 'Protein Energy Balls',
                'calories': 150,
                'description': 'Dates, oats, peanut butter, chia seeds (2 balls)',
                'benefits': 'Natural energy, no added sugar',
                'bestTime': 'Pre or post-workout'
            }
        ]
        
        # Filter based on diet
        if is_veg or 'Vegan' in diet_type:
            snacks = [s for s in snacks if 'egg' not in s['name'].lower()]
        
        return snacks
    
    def _generate_drink_recommendations(self, occupation: str, stress_level: int,
                                         health_conditions: List) -> List[Dict]:
        """Generate healthy drink recommendations"""
        
        drinks = [
            {
                'name': 'Green Tea',
                'calories': 2,
                'description': 'Freshly brewed green tea with lemon',
                'benefits': 'Antioxidants, metabolism boost, calm focus',
                'servings': '2-3 cups daily'
            },
            {
                'name': 'Coconut Water',
                'calories': 45,
                'description': 'Fresh coconut water',
                'benefits': 'Natural electrolytes, hydration, minerals',
                'servings': '1-2 glasses daily'
            },
            {
                'name': 'Fresh Fruit Smoothie',
                'calories': 180,
                'description': 'Banana, berries, spinach, almond milk',
                'benefits': 'Vitamins, fiber, natural sweetness',
                'servings': '1 glass daily'
            },
            {
                'name': 'Herbal Tea (Chamomile/Peppermint)',
                'calories': 0,
                'description': 'Caffeine-free herbal tea',
                'benefits': 'Relaxation, digestion, stress relief',
                'servings': '1-2 cups daily, especially evening'
            },
            {
                'name': 'Fresh Lime Water',
                'calories': 20,
                'description': 'Water with fresh lime juice, mint',
                'benefits': 'Vitamin C, refreshing, alkalizing',
                'servings': '2-3 glasses daily'
            },
            {
                'name': 'Buttermilk (Chaas)',
                'calories': 60,
                'description': 'Low-fat buttermilk with cumin, coriander',
                'benefits': 'Probiotics, cooling, digestion',
                'servings': '1 glass daily'
            },
            {
                'name': 'Beetroot Juice',
                'calories': 70,
                'description': 'Fresh beetroot juice with carrot',
                'benefits': 'Iron, blood health, endurance',
                'servings': '1 small glass daily'
            },
            {
                'name': 'Golden Milk (Turmeric Latte)',
                'calories': 120,
                'description': 'Warm milk with turmeric, honey, black pepper',
                'benefits': 'Anti-inflammatory, immunity, sleep quality',
                'servings': '1 cup before bed'
            }
        ]
        
        if stress_level > 6:
            # Emphasize stress-relief drinks
            drinks[0]['recommendation'] = 'Highly recommended for stress management'
            drinks[3]['recommendation'] = 'Perfect for evening relaxation'
        
        return drinks
    
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
