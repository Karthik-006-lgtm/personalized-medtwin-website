import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import json

# Page configuration
st.set_page_config(
    page_title="Health Monitoring Platform",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# API Configuration
BACKEND_URL = "http://localhost:5000/api"
ML_URL = "http://localhost:5001/api"

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #1e40af;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        margin: 1rem 0;
    }
    .success-box {
        background-color: #d1fae5;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #10b981;
    }
    .warning-box {
        background-color: #fef3c7;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #f59e0b;
    }
    .danger-box {
        background-color: #fee2e2;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #ef4444;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'user_token' not in st.session_state:
    st.session_state.user_token = None
if 'user_data' not in st.session_state:
    st.session_state.user_data = None

# Authentication Functions
def login(email, password):
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", 
                               json={"email": email, "password": password})
        if response.status_code == 200:
            data = response.json()
            st.session_state.logged_in = True
            st.session_state.user_token = data.get('token')
            st.session_state.user_data = data.get('user')
            return True, "Login successful!"
        else:
            return False, "Invalid credentials"
    except Exception as e:
        return False, f"Error: {str(e)}"

def signup(email, password):
    try:
        response = requests.post(f"{BACKEND_URL}/auth/signup", 
                               json={"email": email, "password": password})
        if response.status_code == 201:
            return True, "Account created! Please login."
        else:
            return False, response.json().get('error', 'Signup failed')
    except Exception as e:
        return False, f"Error: {str(e)}"

def logout():
    st.session_state.logged_in = False
    st.session_state.user_token = None
    st.session_state.user_data = None

# Main App
def main():
    if not st.session_state.logged_in:
        show_auth_page()
    else:
        show_dashboard()

def show_auth_page():
    st.markdown('<h1 class="main-header">🏥 Health Monitoring Platform</h1>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Login", "Sign Up"])
    
    with tab1:
        st.subheader("Login to Your Account")
        email = st.text_input("Email", key="login_email")
        password = st.text_input("Password", type="password", key="login_password")
        
        if st.button("Login", type="primary", use_container_width=True):
            if email and password:
                success, message = login(email, password)
                if success:
                    st.success(message)
                    st.rerun()
                else:
                    st.error(message)
            else:
                st.warning("Please fill in all fields")
    
    with tab2:
        st.subheader("Create New Account")
        email = st.text_input("Email", key="signup_email")
        password = st.text_input("Password", type="password", key="signup_password")
        confirm_password = st.text_input("Confirm Password", type="password", key="confirm_password")
        
        if st.button("Sign Up", type="primary", use_container_width=True):
            if email and password and confirm_password:
                if password == confirm_password:
                    success, message = signup(email, password)
                    if success:
                        st.success(message)
                    else:
                        st.error(message)
                else:
                    st.error("Passwords don't match")
            else:
                st.warning("Please fill in all fields")

def show_dashboard():
    # Sidebar
    with st.sidebar:
        st.title("🏥 Health Monitor")
        st.write(f"Welcome, {st.session_state.user_data.get('email', 'User')}")
        
        page = st.radio("Navigation", 
                       ["Dashboard", "Health Data Entry", "AI Predictions", 
                        "Nutrition Plan", "Medical Documents", "Profile"])
        
        if st.button("Logout", type="secondary", use_container_width=True):
            logout()
            st.rerun()
    
    # Main content
    if page == "Dashboard":
        show_dashboard_page()
    elif page == "Health Data Entry":
        show_health_entry_page()
    elif page == "AI Predictions":
        show_predictions_page()
    elif page == "Nutrition Plan":
        show_nutrition_page()
    elif page == "Medical Documents":
        show_documents_page()
    elif page == "Profile":
        show_profile_page()

def show_dashboard_page():
    st.title("📊 Health Dashboard")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Heart Rate", "72 bpm", "2 bpm")
    with col2:
        st.metric("Blood Pressure", "120/80", "-5 mmHg")
    with col3:
        st.metric("SpO2", "98%", "1%")
    with col4:
        st.metric("Sleep", "7.5 hrs", "0.5 hrs")
    
    st.markdown("---")
    
    # Sample chart
    dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
    heart_rate = [70 + i % 10 for i in range(30)]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=dates, y=heart_rate, mode='lines+markers', name='Heart Rate'))
    fig.update_layout(title="Heart Rate Trend (Last 30 Days)", 
                     xaxis_title="Date", yaxis_title="BPM")
    st.plotly_chart(fig, use_container_width=True)

def show_health_entry_page():
    st.title("📝 Enter Health Data")
    
    col1, col2 = st.columns(2)
    
    with col1:
        heart_rate = st.number_input("Heart Rate (bpm)", min_value=40, max_value=200, value=72)
        systolic = st.number_input("Systolic BP (mmHg)", min_value=80, max_value=200, value=120)
        oxygen = st.number_input("Oxygen Saturation (%)", min_value=70, max_value=100, value=98)
        temperature = st.number_input("Body Temperature (°F)", min_value=95.0, max_value=105.0, value=98.6)
        glucose = st.number_input("Blood Glucose (mg/dL)", min_value=50, max_value=400, value=100)
    
    with col2:
        diastolic = st.number_input("Diastolic BP (mmHg)", min_value=40, max_value=130, value=80)
        sleep_hours = st.number_input("Sleep Hours", min_value=0.0, max_value=24.0, value=7.0)
        steps = st.number_input("Steps", min_value=0, max_value=50000, value=8000)
        calories = st.number_input("Calories Burned", min_value=0, max_value=5000, value=2000)
        stress_level = st.slider("Stress Level", min_value=1, max_value=10, value=5)
    
    weight = st.number_input("Weight (kg)", min_value=30.0, max_value=300.0, value=70.0)
    
    if st.button("Save Health Data", type="primary", use_container_width=True):
        health_data = {
            "heartRate": heart_rate,
            "bloodPressure": f"{systolic}/{diastolic}",
            "oxygenSaturation": oxygen,
            "bodyTemperature": temperature,
            "bloodGlucose": glucose,
            "sleepHours": sleep_hours,
            "steps": steps,
            "caloriesBurned": calories,
            "stressLevel": stress_level,
            "weight": weight,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            headers = {"Authorization": f"Bearer {st.session_state.user_token}"}
            response = requests.post(f"{BACKEND_URL}/health/data", 
                                   json=health_data, headers=headers)
            if response.status_code == 201:
                st.success("✅ Health data saved successfully!")
            else:
                st.error("Failed to save data")
        except Exception as e:
            st.error(f"Error: {str(e)}")

def show_predictions_page():
    st.title("🤖 AI Health Predictions")
    
    st.info("Click the button below to get AI-powered health insights based on your latest data")
    
    if st.button("Analyze My Health", type="primary", use_container_width=True):
        with st.spinner("Analyzing your health data..."):
            try:
                # Mock prediction for demo
                st.markdown('<div class="success-box">', unsafe_allow_html=True)
                st.markdown("### 🎯 Health Analysis Results")
                st.markdown("**Overall Health Score:** 85/100")
                st.markdown("**Risk Level:** Low")
                st.markdown('</div>', unsafe_allow_html=True)
                
                st.markdown("---")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("### ✅ Positive Indicators")
                    st.write("- Heart rate within normal range")
                    st.write("- Good oxygen saturation")
                    st.write("- Adequate sleep duration")
                    st.write("- Active lifestyle (steps)")
                
                with col2:
                    st.markdown("### ⚠️ Areas for Improvement")
                    st.write("- Slightly elevated stress levels")
                    st.write("- Consider more hydration")
                    st.write("- Monitor blood pressure regularly")
                
                st.markdown("---")
                st.markdown("### 💡 Recommendations")
                st.write("1. Continue regular exercise routine")
                st.write("2. Practice stress management techniques")
                st.write("3. Maintain consistent sleep schedule")
                st.write("4. Stay hydrated throughout the day")
                
            except Exception as e:
                st.error(f"Error: {str(e)}")

def show_nutrition_page():
    st.title("🍎 AI Nutrition Recommendations")
    
    st.info("Personalized meal plans based on your health profile and occupation")
    
    # Day selector
    day = st.selectbox("Select Day", 
                      ["Monday", "Tuesday", "Wednesday", "Thursday", 
                       "Friday", "Saturday", "Sunday"])
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("### 🌅 Breakfast")
        st.write("**Oatmeal with Berries**")
        st.write("Calories: 350 kcal")
        st.write("- 1 cup oatmeal")
        st.write("- Mixed berries")
        st.write("- Honey drizzle")
        st.write("- Almonds")
    
    with col2:
        st.markdown("### 🌞 Lunch")
        st.write("**Grilled Chicken Salad**")
        st.write("Calories: 450 kcal")
        st.write("- Grilled chicken breast")
        st.write("- Mixed greens")
        st.write("- Olive oil dressing")
        st.write("- Whole grain bread")
    
    with col3:
        st.markdown("### 🌙 Dinner")
        st.write("**Salmon with Vegetables**")
        st.write("Calories: 500 kcal")
        st.write("- Baked salmon")
        st.write("- Steamed broccoli")
        st.write("- Brown rice")
        st.write("- Side salad")
    
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🥤 Healthy Drinks")
        st.write("- Green tea")
        st.write("- Fresh fruit juice")
        st.write("- Coconut water")
        st.write("- Herbal tea")
    
    with col2:
        st.markdown("### 🍪 Healthy Snacks")
        st.write("- Mixed nuts")
        st.write("- Greek yogurt")
        st.write("- Apple slices")
        st.write("- Protein bar")

def show_documents_page():
    st.title("📁 Medical Documents")
    
    st.subheader("Upload New Document")
    
    doc_type = st.selectbox("Document Type", 
                           ["X-Ray", "MRI", "Prescription", "Lab Report"])
    uploaded_file = st.file_uploader("Choose a file", 
                                    type=['pdf', 'jpg', 'jpeg', 'png', 'docx'])
    notes = st.text_area("Notes (optional)")
    
    if st.button("Upload Document", type="primary"):
        if uploaded_file:
            st.success(f"✅ {uploaded_file.name} uploaded successfully!")
        else:
            st.warning("Please select a file to upload")
    
    st.markdown("---")
    st.subheader("Your Documents")
    
    # Mock document list
    documents = [
        {"type": "X-Ray", "name": "Chest X-Ray", "date": "2024-01-15"},
        {"type": "Lab Report", "name": "Blood Test Results", "date": "2024-01-10"},
        {"type": "Prescription", "name": "Monthly Prescription", "date": "2024-01-05"}
    ]
    
    for doc in documents:
        col1, col2, col3, col4 = st.columns([2, 2, 2, 1])
        with col1:
            st.write(f"📄 {doc['name']}")
        with col2:
            st.write(doc['type'])
        with col3:
            st.write(doc['date'])
        with col4:
            st.button("View", key=doc['name'])

def show_profile_page():
    st.title("👤 User Profile")
    
    tab1, tab2, tab3 = st.tabs(["Basic Info", "Health Details", "Lifestyle"])
    
    with tab1:
        st.subheader("Basic Information")
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("Full Name", value="")
            age = st.number_input("Age", min_value=1, max_value=120, value=25)
            gender = st.selectbox("Gender", ["Male", "Female", "Other"])
        with col2:
            email = st.text_input("Email", value=st.session_state.user_data.get('email', ''))
            phone = st.text_input("Phone Number", value="")
            occupation = st.selectbox("Occupation", 
                                     ["Software Engineer", "Doctor", "Teacher", 
                                      "Driver", "Student", "Other"])
    
    with tab2:
        st.subheader("Health Details")
        col1, col2 = st.columns(2)
        with col1:
            height = st.number_input("Height (cm)", min_value=100, max_value=250, value=170)
            weight = st.number_input("Weight (kg)", min_value=30, max_value=300, value=70)
        with col2:
            blood_group = st.selectbox("Blood Group", 
                                      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
            conditions = st.multiselect("Chronic Conditions", 
                                       ["Diabetes", "Hypertension", "Asthma", 
                                        "Heart Disease", "None"])
    
    with tab3:
        st.subheader("Lifestyle Information")
        exercise = st.selectbox("Exercise Frequency", 
                               ["Daily", "3-4 times/week", "1-2 times/week", "Rarely"])
        diet = st.selectbox("Diet Type", 
                           ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"])
        smoking = st.selectbox("Smoking", ["Never", "Former", "Current"])
        alcohol = st.selectbox("Alcohol Consumption", 
                              ["Never", "Occasionally", "Regularly"])
    
    if st.button("Save Profile", type="primary", use_container_width=True):
        st.success("✅ Profile updated successfully!")

if __name__ == "__main__":
    main()
