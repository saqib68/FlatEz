from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from datetime import datetime, date

class Flat(models.Model):
    id = models.AutoField(primary_key=True)  # Auto-incrementing ID
    name = models.CharField(max_length=100)  # Name of the flat
    numOfFlatmates = models.IntegerField(default=1)
    address = models.CharField(max_length=200)
    created_by_username = models.CharField(unique=True, max_length=100)  # Store the logged-in user's username
    shared_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Shared cost field
    
    def __str__(self):
        return self.name
    
class FlatMate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='flatmate')
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    dob = models.DateField()
    contact = models.CharField(max_length=15)
    flat = models.ForeignKey(Flat, null=True, blank=True, on_delete=models.SET_NULL)  # Initially null
    isadmin = models.BooleanField(default=False)
    accnum = models.CharField(max_length=20, unique=True, null=True, blank=True)  # Account number field
    isPaid = models.BooleanField(default=False)  # New field to track payment status

    def __str__(self):
        return f"{self.firstName} {self.lastName}"
    
class FlatLeaderboard(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='leaderboard')  
    flat = models.ForeignKey(Flat, on_delete=models.CASCADE, related_name='leaderboard', null=True, blank=True)  # Relationship with Flat
    score = models.IntegerField(default=0)

    def __str__(self):
        flat_name = self.flat.name if self.flat else "No Flat"
        return f"{self.user.username} - {self.score} - {flat_name}"
       
class Game(models.Model):
    # Store the username of the player
    username = models.CharField(max_length=100)

    # Store the score of the player
    score = models.IntegerField()

    # Optionally, you can add a timestamp to track when the entry was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.score} points"

    class Meta:
        # Sorting the entries by score in descending order
        ordering = ['-score']    
    
class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')  # User who sent the message
    flat = models.ForeignKey(Flat, on_delete=models.CASCADE, related_name='chats')  # Associated flat
    message = models.TextField()  # Message content
    timestamp = models.DateTimeField(default=now)  # Auto-generated timestamp for when the message was sent
    
    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.user.username}: {self.message[:50]}"  # Returns a preview of the message

    class Meta:
        ordering = ['-timestamp']  # Messages ordered by newest first    
              
class Task(models.Model):
    flat = models.ForeignKey(Flat, on_delete=models.CASCADE, related_name='tasks')
    task = models.CharField(max_length=255)
    doer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    due_date = models.DateField()
    due_time = models.TimeField()
    done = models.BooleanField(default=False)  # Added done field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Task: {self.task} | Doer: {self.doer.username} | Due: {self.due_date} {self.due_time}"

    class Meta:
        ordering = ['due_date', 'due_time']

    def save(self, *args, **kwargs):
        if self.due_date < date.today() or (self.due_date == date.today() and self.due_time < datetime.now().time()):
            raise ValueError("Task due date and time cannot be in the past.")
        super().save(*args, **kwargs)
       
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()  # The notification message
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the notification is created

    def _str_(self):
        return f"{self.message}"        
    
class Account(models.Model):
    accnum = models.CharField(max_length=20, unique=True)  # Account number
    bankname = models.CharField(max_length=100)  # Bank name
    username = models.CharField(max_length=150)  # Independent username field
    cnic = models.CharField(max_length=15, unique=True)  # CNIC number (unique identifier)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # Account balance
    cvv = models.CharField(max_length=3)  # CVV for security
    ccn = models.CharField(max_length=16, unique=True)  # Credit card number
    expiry_date = models.DateField()  # Expiry date for the card
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for account creation

    def __str__(self):
        return f"Account {self.accnum} - {self.username} - {self.bankname}"
      
class Transaction(models.Model):
    transactionid = models.AutoField(primary_key=True)  # Auto-incrementing transaction ID
    sender = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='sent_transactions')  # Sender account
    receiver = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='received_transactions')  # Receiver account
    datetime = models.DateTimeField(default=now)  # Transaction timestamp
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Transaction amount

    def __str__(self):
        return f"Transaction {self.transactionid}: {self.sender.accnum} -> {self.receiver.accnum} | Amount: {self.amount}"

    class Meta:
        ordering = ['-datetime']  # Order transactions by latest    

class Loan(models.Model):
    STATUS_CHOICES = [
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('pending', 'Pending'),
    ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans_sent')  # User who gives the loan
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans_received')  # User who receives the loan
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Loan amount
    loan_date = models.DateTimeField(default=now)  # Date when the loan was taken
    due_date = models.DateField()  # Due date for the loan repayment
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')  # Loan status

    def __str__(self):
        return f"{self.recipient.username}"

    class Meta:
        ordering = ['-loan_date']  # Order loans by the most recent one

class SharedExpense(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly defining the id field as AutoField
    flat = models.ForeignKey('Flat', on_delete=models.CASCADE, related_name='expenses')  # Associated flat
    description = models.CharField(max_length=255)  # Description of the expense
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Expense amount
    due_date = models.DateField()  # Due date for the expense
    due_time = models.TimeField()  # Due time for the expense
    is_paid = models.BooleanField(default=False)  # New field to track if the expense is paid

    def __str__(self):
        return f"{self.description} | Amount: {self.amount} | Due: {self.due_date} {self.due_time} | Paid: {self.is_paid}"

    class Meta:
        ordering = ['due_date', 'due_time']  # Order expenses by due date and time

    def save(self, *args, **kwargs):
        # Ensure that the due date and time is not in the past
        if self.due_date < date.today() or (self.due_date == date.today() and self.due_time < datetime.now().time()):
            raise ValueError("Expense due date and time cannot be in the past.")
        super().save(*args, **kwargs)

class PartyFund(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly defining the id field as AutoField
    purpose = models.CharField(max_length=255)  # Description of the fund's purpose
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Total amount for the party fund
    flat = models.ForeignKey('Flat', on_delete=models.CASCADE, related_name='party_funds')  # Associated flat
    members = models.ManyToManyField(User, related_name='party_funds')  # Members contributing to the fund
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the fund was created
    is_paid = models.BooleanField(default=False)  # Indicates if the fund has been paid
    per_person_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        members_list = ', '.join([member.username for member in self.members.all()])
        return f"Party Fund: {self.purpose} | Flat: {self.flat.name} | Amount: {self.amount} | Paid: {self.is_paid} | Members: {members_list}"

    class Meta:
        ordering = ['-created_at']  # Order by most recently created funds