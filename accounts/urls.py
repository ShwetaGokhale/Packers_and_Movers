from django.urls import path
from . import views


urlpatterns = [
    #_______________Authentication and core views________________
    
    path('', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('partywise-summary-pdf/<int:year>/', views.partywise_summary_pdf, name='partywise_summary_pdf'),
    path('partywise-summary/<int:year>/excel/', views.partywise_summary_excel, name='partywise_summary_excel'),
    path('reports/', views.reports_data_view, name='reports_page'),
    path('export-builty-excel/', views.export_builty_excel, name='export_builty_excel'),
    path('export-builty-pdf/', views.export_builty_pdf, name='export_builty_pdf'),


    #_______________Login and verification________________________
    
    path('verify-email/', views.verify_email_view, name='verify_email'),
    path('logout/', views.logout_view, name='logout'),

    #________________Payment views________________________________
    
    path('record-payment/', views.record_payment_view, name='record_payment'),
    path('get-payment-data/', views.get_payment_data, name='get_payment_data'),
    path('record_save_payment/', views.record_payment, name='record_save_payment'),

    #________________Ledger views_________________________________
    
    path('ledger/', views.ledger_view, name='ledger'),
    path('export-ledger-excel/', views.export_ledger_excel, name='export_ledger_excel'),
    path('export-ledger-pdf/', views.export_ledger_pdf, name='export_ledger_pdf'),
    path('party-ledger/', views.party_ledger_view, name='party_ledger'),
    path('get-payment-history/', views.get_payment_history, name='get_payment_history'),
    path('export-party-ledger-excel/', views.export_party_ledger_excel, name='export_party_ledger_excel'),
    path('export-party-ledger-pdf/', views.export_party_ledger_pdf, name='export_party_ledger_pdf'),

    # path('print-bill/<int:cn_id>/', views.generate_bill, name='print_bill'),


    #_________________Consignment__________________________________
    
    path('consignment/', views.consignment_form_view, name='consignment'),
    path('consignments/get_next_cnid/', views.get_next_cnid, name='get_next_cnid'),
    path('consignments/data/', views.cn_data_view, name='cn_data'),
    path('consignments/export_excel/', views.export_consignments_excel, name='export_consignments_excel'),
    path('export-consignments-pdf/', views.export_consignments_pdf, name='export_consignments_pdf'),
    path('consignment/edit/<int:cnid>/', views.edit_consignment, name='edit_consignment'),
    path('consignment/delete/<int:cnid>/', views.delete_consignment, name='delete_consignment'),


    #_________________Vehicle management____________________________
    
    path('vehicles/add/', views.add_vehicle, name='add_vehicle'),
    path('vehicles/get/', views.get_vehicles, name='get_vehicles'),
    path('vehicles/edit/<int:vehicle_id>/', views.edit_vehicle, name='edit_vehicle'),
    path('vehicles/delete/<int:vehicle_id>/', views.delete_vehicle, name='delete_vehicle'),
    path('vehicle-list/', views.vehicle_list, name='vehicle_list'),

    #__________________Consignee management__________________________
    
    path('consignees/add/', views.add_consignee, name='add_consignee'),
    path('consignees/get/', views.get_consignees, name='get_consignees'),
    path('consignees/delete/<int:consignee_id>/', views.delete_consignee, name='delete_consignee'),

    #___________________Consigner management_________________________
    path('consigners/add/', views.add_consigner, name='add_consigner'),
    path('consigners/get/', views.get_consigners, name='get_consigners'),
    path('consigners/delete/<int:consigner_id>/', views.delete_consigner, name='delete_consigner'),

    #____________________Location management_________________________
    
    path('locations/add/', views.add_location, name='add_location'),
    path('locations/get/', views.get_locations, name='get_locations'),
    path('locations/delete/<int:location_id>/', views.delete_location, name='delete_location'),
    path('locations/', views.location_list_view, name='location_list'),
    path('location/edit/', views.edit_location, name='edit_location'),
    path('location/delete/<int:location_id>/', views.delete_location, name='delete_location'),

    #_____________________Party management____________________________
    
    path('party-list/', views.party_list_view, name='party_list'),
    path('party/edit/', views.edit_party, name='edit_party'),
    path('party/delete/<str:party_type>/<int:party_id>/', views.delete_party, name='delete_party'),    
    
    path('print-bill/<int:cnid>/', views.print_bill, name='print_bill'),
    
    #_____________________Record payment management____________________________
    
    path('cash-book/', views.parcha_view, name='cash_book'),
    path("cash-book/part-payment-parties/", views.part_payment_view, name="get_part_payment_parties"),
    path("get-payment-history/", views.get_payment_history, name="get_payment_history"),

    #_____________________Record expense management____________________________
    path('record-expense/', views.record_expense_view, name='record_expense'),
    path('record-expense/data/', views.staff_employees_view, name='get_staff_employees'),

    path('statement/', views.statement_view, name='statement'),   
    


    #_________________Petrol management____________________________
    path('petrol-pump-list/', views.petrol_pump_list, name='petrol_pump_list'),
    path('petrolpumps/add/', views.add_petrol_pump, name='add_petrol_pump'),
    path('petrolpumps/get/', views.get_petrol_pumps, name='get_petrol_pumps'),
    path('petrolpumps/edit/<int:petrol_pump_id>/', views.edit_petrol_pump, name='edit_petrol_pump'),
    path('petrolpumps/delete/<int:petrol_pump_id>/', views.delete_petrol_pump, name='delete_petrol_pump'),


    #_________________Staff/Employee management____________________________
    path('staffEmployee-list/', views.staffEmployee_list, name='staffEmployee_list'),
    path('staff_employees/add/', views.add_staff_employee, name='add_staff_employee'),
    path('staffEmployees/get/', views.get_staff_employees, name='get_staff_employees'),
    path('staff_employees/edit/<int:staff_employee_id>/', views.edit_staff_employee, name='edit_staff_employee'),
    path('staff_employees/delete/<int:staff_employee_id>/', views.delete_staff_employee, name='delete_staff_employee'),

    #_________________Vehicle management____________________________
    path('vehicle/', views.vehicle_view, name='vehicle'),
    path('record-vehicle-expense/', views.record_vehicle_expense, name='record-vehicle-expense'),

    #_________________Party maintainance____________________________
    path('party-maintainance/', views.party_maintainance_view, name='party_maintainance'),

    #_________________Vehicle maintainance____________________________
    path('vehicle-maintainance/', views.vehicle_maintainance_view, name='vehicle_maintainance'),

    #_________________Record Payment List____________________________
    path('record-payments/', views.record_payment_list_view, name='record_payment_list'),
    path('record-payments/delete/<int:pk>/', views.delete_payment_record, name='delete_payment_record'),
    path('record-payments/edit/<int:pk>/', views.edit_payment_record, name='edit_payment_record'),

    #_________________Record Expense List____________________________
    path('record-expense-list/', views.record_expense_list_view, name='record_expense_list'),
    path("record-expenses/delete/<int:pk>/", views.delete_expense_record, name="delete_expense_record"),

    #_________________Cumulative Report____________________________
    path('cumulative-report/', views.cumulative_report_view, name='cumulative_report'),
    path('cumulative/export/excel/', views.export_cumulative_excel, name='export_cumulative_excel'),
    path('cumulative/export/pdf/', views.export_cumulative_pdf, name='export_cumulative_pdf'),
    

    #_________________Vehicle Cumulative Report____________________________
    path('vehicle-cumulative/', views.vehicle_cumulative_view, name='vehicle_cumulative'),
    path('export-cumulative-vehicle-excel/', views.export_cumulative_vehicle_excel, name='export_cumulative_vehicle_excel'),
    path('vehicle-cumulative/export/pdf/', views.export_cumulative_vehicle_pdf, name='export_cumulative_vehicle_pdf'),
]
