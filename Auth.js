// 1. Initialize using the global CDN instance 
const supabaseUrl = 'https://nfuvwkophsugdbnxgljp.supabase.co' 
const supabaseAnonKey = 'sb_publishable_FXwnJhfWN-xyneJapQjQDw_eF_jO6-P'
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey)

// 2. Grab DOM elements for Form Toggling
const signupForm = document.getElementById('signup-form')
const signinForm = document.getElementById('signin-form')
const toLoginLink = document.getElementById('to-login')
const toSignupLink = document.getElementById('to-signup')

// 3. Grab DOM elements for Buttons
const signupBtn = document.getElementById('signup-btn')
const signinBtn = document.getElementById('signin-btn')


// ================= SWITCH BETWEEN FORMS LOGIC =================
toLoginLink.addEventListener('click', (e) => {
  e.preventDefault()
  signupForm.classList.add('hidden')
  signinForm.classList.remove('hidden')
})

toSignupLink.addEventListener('click', (e) => {
  e.preventDefault()
  signinForm.classList.add('hidden')
  signupForm.classList.remove('hidden')
})


// ================= SIGN UP SUBMIT PROCESS =================
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault() 

  signupBtn.disabled = true
  signupBtn.innerText = 'Creating account...'

  const fullName = document.getElementById('signup-username').value
  const email = document.getElementById('signup-email').value
  const password = document.getElementById('signup-password').value

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName 
      }
    }
  })

  if (error) {
    console.error("Signup Error:", error.message)
    alert(`Error: ${error.message}`)
    signupBtn.disabled = false
    signupBtn.innerText = 'Submit Sign Up'
  } else {
    console.log("User created successfully!", data.user)
    alert("Account created successfully! Redirecting you to the Tax Shield Calculator...")
    
    // REDIRECT: Send user straight to your calculator file in the same directory
    window.location.href = "calculator.html" 
  }
})


// ================= SIGN IN SUBMIT PROCESS =================
signinForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  signinBtn.disabled = true
  signinBtn.innerText = 'Signing in...'

  const email = document.getElementById('signin-email').value
  const password = document.getElementById('signin-password').value

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    console.error("Login Error:", error.message)
    alert(`Login Failed: ${error.message}`)
    signinBtn.disabled = false
    signinBtn.innerText = 'Submit Sign In'
  } else {
    console.log("Logged in successfully!", data.session)
    alert("Logged in successfully! Redirecting...")
    
    // REDIRECT: Send verified user straight to your calculator file 
    window.location.href = "calculator.html" 
  }
})


// ================= DATABASE LOGS HISTORY METHODS =================
// Note: Call this inside your calculator.js logic script file when inputs process
async function saveCalculationToHistory(turnoverAmount, calculatedTax) {
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

  if (authError || !user) {
    console.error("No logged-in user found:", authError)
    alert("You must be logged in to save history!")
    return
  }

  const { data, error } = await supabaseClient
    .from('calculations_history')
    .insert([
      { 
        user_id: user.id,          
        turnover: turnoverAmount,  
        tax_owed: calculatedTax    
      }
    ])

  if (error) {
    console.error("Error saving history:", error.message)
  } else {
    console.log("Calculation successfully saved to history!")
  }
}

async function getUserCalculationHistory() {
  const { data: { user } } = await supabaseClient.auth.getUser()

  const { data: historyData, error } = await supabaseClient
    .from('calculations_history')
    .select('turnover, tax_owed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) 

  if (error) {
    console.error("Error fetching history:", error.message)
    return
  }

  console.log("Your past calculations:", historyData)
}