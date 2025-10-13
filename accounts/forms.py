from django import forms
from .models import *
from datetime import date

class RegisterForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)

   

class LoginForm(forms.Form):
    email = forms.EmailField()
    otp = forms.CharField(required=False, max_length=6)




class ConsignmentCreateForm(forms.ModelForm):
    class Meta:
        model = Consignment
        fields = '__all__'
        labels = {
            'CNID': 'Consignment ID',
            'vehicle_no': 'Vehicle No',
            'cn_no': 'CN No',
            'consignee': 'Consignee',
            'consigner': 'Consigner',
            'Booking_Date': 'Booking Date',
            'Loading_Date': 'Loading Date',
            'Unloading_Date': 'Unloading Date',
            'From_Location': 'From Location',
            'To_Location': 'To Location',
            'Truck_Freight': 'Truck Freight',
            'Advance_Amount': 'Advance Amount',
            'Balance_Amount': 'Balance Amount',
            'Innam': 'Innam',
            'Extra_TF': 'Extra TF',
        }
        widgets = {
            'Booking_Date': forms.DateInput(attrs={'type': 'date'}),
            'Loading_Date': forms.DateInput(attrs={'type': 'date'}),
            'Unloading_Date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        today = date.today()
        if not self.initial.get('Booking_Date'):
            self.fields['Booking_Date'].initial = today
        if not self.initial.get('Loading_Date'):
            self.fields['Loading_Date'].initial = today


class ConsignmentEditForm(forms.ModelForm):
    class Meta:
        model = Consignment
        exclude = ['CNID']  # Exclude CNID during edit

        labels = {
            'vehicle_no': 'Vehicle No',
            'cn_no': 'CN No',
            'consignee': 'Consignee',
            'consigner': 'Consigner',
            'Booking_Date': 'Booking Date',
            'Loading_Date': 'Loading Date',
            'Unloading_Date': 'Unloading Date',
            'From_Location': 'From Location',
            'To_Location': 'To Location',
            'Truck_Freight': 'Truck Freight',
            'Advance_Amount': 'Advance Amount',
            'Balance_Amount': 'Balance Amount',
            'Innam': 'Innam',
            'Extra_TF': 'Extra TF',
        }

        widgets = {
            'Booking_Date': forms.DateInput(attrs={'type': 'date'}),
            'Loading_Date': forms.DateInput(attrs={'type': 'date'}),
            'Unloading_Date': forms.DateInput(attrs={'type': 'date'}),
        }

# class ConsignmentForm(forms.ModelForm):
#     class Meta:
#         model = Consignment
#         fields = '__all__'
#         exclude = ['CNID'] 
#         labels = {
#             'vehicle_no': 'Vehicle No',
#             'cn_no': 'CN No',
#             'consignee': 'Consignee',
#             'consigner': 'Consigner',
#             #'goods_info': 'Goods Information', # Still present to receive JSON string from frontend
#             'Booking_Date': 'Booking Date',
#             'Loading_Date': 'Loading Date',
#             'Unloading_Date': 'Unloading Date',
#             'From_Location': 'From Location',
#             'To_Location': 'To Location',
#             'Truck_Freight': 'Truck Freight',
#             'Advance_Amount': 'Advance Amount',
#             'Balance_Amount': 'Balance Amount',
#             'Innam': 'Innam',
#             'Extra_TF': 'Extra TF',
#         }

#         widgets = {
#             'Booking_Date': forms.DateInput(attrs={'type': 'date'}),
#             'Loading_Date': forms.DateInput(attrs={'type': 'date'}),
#             'Unloading_Date': forms.DateInput(attrs={'type': 'date'}),
#             #'goods_info': forms.HiddenInput(), # Hide this field as it's for internal JSON transfer
            
#         }

# Updated VehicleForm
class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = ['vehicle_number', 'owner_name', 'owner_phone', 'date_added']
        widgets = {
            'date_added': forms.DateInput(attrs={'type': 'date'}),
        }
        labels = {
            'vehicle_number': 'Vehicle Number',
            'owner_name': 'Owner Name',
            'owner_phone': 'Owner Phone',
            'date_added': 'Date Added',
        }



# class ConsigneeForm(forms.ModelForm):
#     """
#     A ModelForm for the Consignee model.
#     Simplifies creating and updating Consignee instances from form data.
#     """
#     class Meta:
#         model = Consignee
#         # '__all__' includes all fields from the model
#         fields = '__all__'
        
#         # Customize labels displayed in the form
#         labels = {
#             'name': 'Consignee Name',
#             'date_added': 'Date',
#             'address': 'Address',
#         }
        
#         # Customize widgets for form fields (e.g., HTML5 date input)
#         widgets = {
#             'date_added': forms.DateInput(attrs={'type': 'date'}),
#             # 'address': forms.Textarea(attrs={'rows': 3}), # Example: if you want a specific textarea size
#         }

#     def clean_name(self):
#         """
#         Custom validation for the 'name' field.
#         Ensures the consignee name is unique (though unique=True in model already handles this
#         at the database level, explicit form cleaning can provide better user feedback).
#         """
#         name = self.cleaned_data['name']
#         # In a real Django project, you'd query the database:
#         # if Consignee.objects.filter(name=name).exclude(pk=self.instance.pk if self.instance else None).exists():
#         #     raise forms.ValidationError("A consignee with this name already exists.")
        
#         # For our dummy, the model's save method will handle uniqueness checking.
#         return name


class ConsigneeForm(forms.ModelForm):
    class Meta:
        model = Consignee
        fields = ['consignee_name', 'date_added', 'consignee_address', 'contact_no']  #  Added contact_no
        widgets = {
            'date_added': forms.DateInput(attrs={'type': 'date'}),
            'contact_no': forms.TextInput(attrs={'placeholder': 'Enter Contact No'}),  #  Optional widget
        }
        labels = {
            'consignee_name': 'Consignee Name',
            'date_added': 'Date Added',
            'consignee_address': 'Consignee Address',
            'contact_no': 'Contact No.',  #  Label
        }

class ConsignerForm(forms.ModelForm):
    class Meta:
        model = Consigner
        fields = ['consigner_name', 'date_added', 'consigner_address']
        widgets = {
            'date_added': forms.DateInput(attrs={'type': 'date'}),
        }
        labels = {
            'consigner_name': 'Consigner Name',
            'date_added': 'Date Added',
            'consigner_address': 'Consigner Address',
        }



# NEW ConsignmentNoteForm (for the CN management modal)
# class ConsignmentNoteForm(forms.ModelForm):
#     class Meta:
#         model = ConsignmentNote
#         fields = ['vehicle_number_ref', 'cn_number', 'booking_date', 'loading_date', 'unloading_date']
#         widgets = {
#             'booking_date': forms.DateInput(attrs={'type': 'date'}),
#             'loading_date': forms.DateInput(attrs={'type': 'date'}),
#             'unloading_date': forms.DateInput(attrs={'type': 'date'}),
#         }
#         labels = {
#             'vehicle_number_ref': 'Vehicle No.',
#             'cn_number': 'CN No.',
#             'booking_date': 'Booking Date',
#             'loading_date': 'Loading Date',
#             'unloading_date': 'Unloading Date',
#             'from_location': 'From Location',
#         }


# NEW LocationForm
class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = ['location_name', 'date_added']
        widgets = {
            'date_added': forms.DateInput(attrs={'type': 'date'}),
        }
        labels = {
            'location_name': 'Location Name',
            'date_added': 'Date Added',
        }


class GoodsInfoForm(forms.ModelForm):
    class Meta:
        model = GoodsInfo
        fields = [
            'consignment', 'unit', 'quantity', 'rate', 'gi_amount',
            'party_payment', 'paid_amount', 'from_party', 'to_party'
        ]
        widgets = {
            'unit': forms.TextInput(attrs={'placeholder': 'Unit No.', 'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'placeholder': 'Quantity', 'class': 'form-control'}),
            'rate': forms.NumberInput(attrs={'placeholder': 'Rate', 'class': 'form-control', 'step': '0.01'}),
            'gi_amount': forms.NumberInput(attrs={'readonly': 'readonly', 'class': 'form-control'}),
            'party_payment': forms.NumberInput(attrs={'placeholder': 'Party Payment', 'class': 'form-control', 'step': '0.01'}),
            'paid_amount': forms.NumberInput(attrs={'placeholder': 'Paid Amount', 'class': 'form-control', 'step': '0.01'}),
            'from_party': forms.TextInput(attrs={'placeholder': 'From Party', 'class': 'form-control'}),
            'to_party': forms.TextInput(attrs={'placeholder': 'To Party', 'class': 'form-control'}),
        }
        labels = {
            'unit': 'Unit No.',
            'quantity': 'Quantity (Kg)',
            'rate': 'Rate',
            'gi_amount': 'GI Amount',
            'party_payment': 'Party Payment',
            'paid_amount': 'Paid Amount',
            'from_party': 'From Party',
            'to_party': 'To Party',
        }
        

# Updated PetrolPumpForm
class PetrolPumpForm(forms.ModelForm):
    class Meta:
        model = PetrolPump
        fields = ['petrol_pump_name', 'owner_name', 'owner_phone', 'address','date_added']
        widgets = {
            'date_added': forms.DateInput(attrs={'type': 'date'}),
        }
        labels = {
            'petrol_pump_name': 'Petrol Pump Name',
            'owner_name': 'Owner Name',
            'owner_phone': 'Owner Phone',
            'address': 'Address',
            'date_added': 'Date Added',
        }


# Updated PetrolPumpForm
class StaffEmployeeForm(forms.ModelForm):
    class Meta:
        model = StaffEmployee
        fields = ['staff_employee_name', 'phone_no', 'address','date_added']
        widgets = {
            'date_added': forms.DateInput(attrs={'type': 'date'}),
        }
        labels = {
            'staff_employee_name': 'Staff Employee Name',
            'phone_no': 'Phone No.',
            'address': 'Address',
            'date_added': 'Date Added',
        }