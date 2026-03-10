import React from 'react'

const Checkout = ({activeStep = 0}) => {
  return (
    <div className="stepsarrange mb-5 flex flex-wrap mt-20">
        {["تسجيل الدخول" , "عنوان التوصيل" , "تأكيد الطلب"].map((step, index) => (
            <div
                key={step}
                className={`flex-1 border-b-2 text-center ${index <= activeStep ? 'border-amber-500 text-amber-600' : 'border-gray-400 text-gray-400 mx-2' }`}>
                    {step}
            </div>
        ))}
    </div>
  )
}

export default Checkout
