from django.db import models
from django.utils import timezone


class RegisterModel(models.Model):
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    confirm_password = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.email


class LoginModel(models.Model):
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.email


class OTPModel(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.email} - OTP: {self.otp}"


class Consignee(models.Model):
    consignee_name = models.CharField(max_length=100, unique=True, verbose_name="Consignee No.")
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")
    consignee_address = models.CharField(max_length=100)
    contact_no = models.CharField(max_length=10, null=True, blank=True, verbose_name="Contact No.")  # New field added

    class Meta:
        ordering = ['-date_added', 'consignee_name', 'consignee_address']

    def __str__(self):
        return self.consignee_name


class Consigner(models.Model):
    consigner_name = models.CharField(max_length=100, unique=True, verbose_name="Consigner No.")
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")
    consigner_address = models.CharField(max_length=100)

    class Meta:
        ordering = ['-date_added', 'consigner_name', 'consigner_address']

    def __str__(self):
        return self.consigner_name  # ❗Fix here: was returning consignee_name by mistake
    

# Updated Vehicle model
class Vehicle(models.Model):
    vehicle_number = models.CharField(max_length=100, unique=True, verbose_name="Vehicle No.")
    owner_name = models.CharField(
        max_length=100, null=True, blank=True, verbose_name="Owner Name"
    )  # Optional field
    owner_phone = models.CharField(
        max_length=15, null=True, blank=True, verbose_name="Owner Phone"
    )  # Optional field
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")

    class Meta:
        ordering = ['-date_added', 'vehicle_number']

    def __str__(self):
        return self.vehicle_number



# NEW Location model
class Location(models.Model):
    location_name = models.CharField(max_length=255, unique=True, verbose_name="Location Name")
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")

    class Meta:
        ordering = ['-date_added', 'location_name'] # Order by newest first by default

    def __str__(self):
        return self.location_name


class Consignment(models.Model):
    CNID = models.AutoField(primary_key=True,unique=True)
    Vehicle_No = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    Cn_No = models.CharField(max_length=100, unique=False, blank=True, null=True)

    consignee = models.ForeignKey(Consignee, on_delete=models.CASCADE)
    consigner = models.ForeignKey(Consigner, on_delete=models.CASCADE)

    from_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='from_location')
    To_Location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='to_location')

    Booking_Date = models.DateField(default=timezone.now)
    Loading_Date = models.DateField()
    Unloading_Date = models.DateField()
    
    Truck_Freight = models.IntegerField()
    Advance_Amount = models.DecimalField(max_digits=10, decimal_places=2)
    Balance_Amount = models.DecimalField(max_digits=10, decimal_places=2)
    Innam = models.IntegerField()
    Extra_TF = models.IntegerField()
    total_fare = models.IntegerField(default=0, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)



# models.py

# UNIT_CHOICES = [
#     ('kg', 'kg'),
#     ('carat', 'carat'),
# ]
UNIT_CHOICES = [
    ("10kg", "10 KG"),
    ("15kg", "15 KG"),
    ("20kg", "20 KG"),
]
class GoodsInfo(models.Model):
    GI_ID = models.AutoField(primary_key=True,unique=True)

    consignment = models.ForeignKey(
        Consignment,
        on_delete=models.CASCADE,
        related_name='goods_items',
        null=True,
        blank=True
    )

    unit = models.CharField(
        max_length=255,
        verbose_name="Unit",
        choices=UNIT_CHOICES,
        null=True,
        blank=True
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantity (Kg)", null=True, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Rate", null=True, blank=True)
    gi_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="GI Amount", default=0.00)


    from_party = models.ForeignKey(Consignee,on_delete=models.SET_NULL,null=True,blank=True,related_name='gi_from',verbose_name="from_Party")
    to_party = models.ForeignKey(Consignee,on_delete=models.SET_NULL,null=True,blank=True,related_name='gi_to',verbose_name="to_Party")

    party_payment = models.DateField(null=True, blank=True, verbose_name="Party Payment Date")
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Paid Amount")
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['GI_ID']

    def __str__(self):
        return f"GI ID: {self.GI_ID} (CNID: {self.consignment.CNID if self.consignment else 'N/A'})"

    # def save(self, *args, **kwargs):
    #     if self.quantity and self.rate:
    #         self.gi_amount = self.quantity * self.rate
    #     super().save(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        if not getattr(self, '_skip_gi_calc', False):  # 👈 Skip auto-calc during payment
            # Auto-calculate GI amount
            if self.quantity and self.rate:
                self.gi_amount = self.quantity * self.rate

            # # Automatically set paid_date if not already provided
            # if not self.paid_date:
            #     self.paid_date = now().date()
        super().save(*args, **kwargs)

    

class PaymentRecord(models.Model):
    PAYMENT_TYPE_CHOICES = (
        ("Parcha", "Parcha"),
        ("Part Payment", "Part Payment"),
    )

    PAYMENT_MODE_CHOICES = (
        ("Cash", "Cash"),
        ("Online", "Online"),
        ("Cheque", "Cheque"),
    )


    # Auto-incrementing serial number
    id = models.AutoField(primary_key=True)  # Acts as S.No.

    # Foreign key to GoodsInfo (represents GI_ID)

    goods_info = models.ForeignKey(GoodsInfo, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')

    # Optional: Get Vehicle No from related consignment
    
    consignment = models.ForeignKey(Consignment, on_delete=models.CASCADE, null=True, blank=True)

    # Party name (stored as plain text for flexibility)
    party = models.CharField(max_length=255)

    # Amounts
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Payment type
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    payment_mode = models.CharField(max_length=50, choices=PAYMENT_MODE_CHOICES, default="Cash")

    # Date fields
    payment_date = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)
    
    remark = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.gi} - {self.party} - {self.payment_type}"
    

# Updated PetrolPump model
class PetrolPump(models.Model):
    petrol_pump_name = models.CharField(max_length=100, unique=True, verbose_name="Petrol Pump Name.")
    owner_name = models.CharField(
        max_length=100, null=True, blank=True, verbose_name="Owner Name"
    )  # Optional field
    owner_phone = models.CharField(
        max_length=15, null=True, blank=True, verbose_name="Owner Phone"
    )  # Optional field
    address = models.CharField(max_length=100)
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_added', 'petrol_pump_name']

    def __str__(self):
        return self.petrol_pump_name
    


# Updated StaffEmployee model
class StaffEmployee(models.Model):
    staff_employee_name = models.CharField(max_length=100, unique=True, verbose_name="Staff Employee Name.")
    phone_no = models.CharField(
        max_length=15, null=True, blank=True, verbose_name="Phone No."
    )  # Optional field
    address = models.CharField(max_length=100)
    date_added = models.DateField(default=timezone.now, verbose_name="Date Added")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_added', 'staff_employee_name']

    def __str__(self):
        return self.staff_employee_name
    

class RecordExpense(models.Model):
    PAYMENT_TYPE_CHOICES = (
        ("Petrol Pump", "Petrol Pump"),
        ("Staff/Employee", "Staff/Employee"),
        ("Vehicle", "Vehicle"),  # ✅ Add this choice
    )
    PAYMENT_MODE_CHOICES = (
        ("Cash", "Cash"),
        ("Online", "Online"),
        ("Cheque", "Cheque"),
    )
    id = models.AutoField(primary_key=True)
    expense_account_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    expense_account_name = models.CharField(max_length=50)  # No choices
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    payment_mode = models.CharField(max_length=50, choices=PAYMENT_MODE_CHOICES, default="Cash")
    remark = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.expense_account_type} - {self.expense_account_name} - {self.paid_amount} - {self.payment_date}"