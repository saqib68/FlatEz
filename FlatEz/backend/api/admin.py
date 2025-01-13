from django.contrib import admin
from .models import *

class FlatAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by_username','shared_cost')  # Fields to display in the admin list view
    search_fields = ('name', 'created_by_username')  # Enable search functionality

class GameAdmin(admin.ModelAdmin):
    list_display = ('username', 'score', 'created_at')  # Fields to display in the list view
    list_filter = ('created_at',)  # Add filter options by creation date
    search_fields = ('username',)  # Add a search bar for username field
    ordering = ('-score',)  # Default ordering by score in descending order

class FlatLeaderboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'flat', 'score')  # Display fields in the list view
    search_fields = ('user__username', 'flat__name')  # Enable search by username or flat name
    list_filter = ('flat',)  # Add filter option by flat

class FlatMateAdmin(admin.ModelAdmin):
    list_display = ('firstName', 'lastName', 'email', 'dob', 'contact', 'flat','isadmin','accnum','isPaid')  # Fields to display in the list view
    search_fields = ('firstName', 'lastName', 'email')  # Make certain fields searchable
    list_filter = ('flat',)  # Enable filtering by flat

class TaskAdmin(admin.ModelAdmin):
    # Display important fields in the admin list view
    list_display = ('task', 'doer', 'flat', 'due_date', 'due_time', 'created_at','done')
    
    # Enable filtering by flat, doer, and due date
    list_filter = ('flat', 'doer', 'due_date')
    
    # Add search capability for task description, doer username, and flat name
    search_fields = ('task', 'doer__username', 'flat__name')
    
    # Define ordering in admin
    ordering = ('due_date', 'due_time')
    
    # Make created_at read-only
    readonly_fields = ('created_at',)
    
    # Group fields into collapsible sections
    fieldsets = (
        ('Task Information', {
            'fields': ('flat', 'task', 'doer', 'due_date', 'due_time')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)  # Makes this section collapsible
        }),
    )

class ChatAdmin(admin.ModelAdmin):
    list_display = ('user', 'flat', 'message_preview', 'timestamp')  # Display columns in the admin list view
    search_fields = ('user__username', 'flat__name', 'message')  # Searchable fields
    list_filter = ('flat', 'timestamp')  # Filters for easy navigation
    ordering = ('-timestamp',)  # Default ordering by timestamp

    # Custom method to show a preview of the message
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message Preview'  # Column label in admin

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'message')  # Fields to display in the admin list view
    search_fields = ('user__username', 'message')  # Enable search functionality by user and message
    list_filter = ('user',)  # Add filter options by user
    ordering = ('-id',)  # Default ordering by ID in descending order

class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transactionid', 'sender', 'receiver', 'amount', 'datetime')  # Fields to display
    search_fields = ('transactionid', 'sender__accnum', 'receiver__accnum')  # Enable search by transaction ID, sender, and receiver account numbers
    list_filter = ('datetime',)  # Filter by transaction date
    ordering = ('-datetime',)  # Default ordering by latest transactions
    readonly_fields = ('datetime',)  # Make datetime read-only

class AccountAdmin(admin.ModelAdmin):
    list_display = ('accnum', 'bankname', 'username', 'cnic', 'balance', 'expiry_date', 'created_at')  # Updated to use `username`
    search_fields = ('accnum', 'bankname', 'username', 'cnic')  # Search by `username` instead of `user`
    list_filter = ('bankname', 'expiry_date')  # Filters for easy navigation
    ordering = ('-created_at',)  # Default ordering by creation date in descending order
    readonly_fields = ('created_at',)  # Make created_at read-only
    fieldsets = (
        ('Account Information', {
            'fields': ('accnum', 'bankname', 'username', 'cnic', 'balance', 'cvv', 'ccn', 'expiry_date')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)  # Makes this section collapsible
        }),
    )

class LoanAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = ('id', 'sender', 'recipient', 'amount', 'loan_date', 'due_date', 'status')  # Updated to show status
    
    # Add filtering options for the admin panel
    list_filter = ('status', 'loan_date', 'sender', 'recipient')  # Updated to filter by status instead of paid
    
    # Add search functionality
    search_fields = ('sender__username', 'recipient__username', 'amount')  # No change here, searching by sender, recipient, or amount
    
    # Customize the ordering of the records
    ordering = ['-loan_date']  # Order loans by the most recent one
    
    # Add pagination (optional)
    list_per_page = 20  # Display 20 items per page in the admin

class SharedExpenseAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = ('id','description', 'amount', 'flat', 'due_date', 'due_time', 'is_paid')
    
    # Enable search functionality
    search_fields = ('description', 'flat__name')
    
    # Add filter options
    list_filter = ('flat', 'due_date')
    
    # Customize the default ordering of the records
    ordering = ('due_date', 'due_time')

# Custom admin for PartyFund model
class PartyFundAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = ('id','purpose', 'amount', 'flat', 'created_at', 'members_list','is_paid','per_person_cost')

    # Enable search functionality
    search_fields = ('purpose', 'flat__name', 'members__username')

    # Add filter options
    list_filter = ('flat', 'created_at')

    # Customize the default ordering of the records
    ordering = ('-created_at',)

    # Define a method to display members in the admin list view
    def members_list(self, obj):
        return ', '.join([member.username for member in obj.members.all()])
    members_list.short_description = 'Members'

admin.site.register(FlatLeaderboard, FlatLeaderboardAdmin)
admin.site.register(Game, GameAdmin)
admin.site.register(PartyFund, PartyFundAdmin)
admin.site.register(SharedExpense, SharedExpenseAdmin)
admin.site.register(Loan, LoanAdmin)
admin.site.register(Account, AccountAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Flat)
admin.site.register(FlatMate, FlatMateAdmin)
admin.site.register(Task,TaskAdmin)
admin.site.register(Chat,ChatAdmin)
admin.site.register(Notification, NotificationAdmin)