from .serializers import *
from .models import *
from django.shortcuts import render
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound,ValidationError
from datetime import date
import random

class CreateFlatMateView(generics.CreateAPIView):
    queryset = FlatMate.objects.all()
    serializer_class = FlatMateSerializer
    permission_classes = [AllowAny]  # Allow anyone to register

    def perform_create(self, serializer):
        # Extract accnum from the validated data (from the FlatMate serializer)
        accnum = serializer.validated_data.get('accnum')

        # Check if the accnum exists in the Account model
        if not Account.objects.filter(accnum=accnum).exists():
            raise ValidationError("The provided account number does not exist in the system.")
        
        # Check if the accnum is already associated with another FlatMate
        if FlatMate.objects.filter(accnum=accnum).exists():
            raise ValidationError("This account number is already associated with another flatmate.")

        # Create FlatMate instance if accnum is valid and not already taken
        flatmate = serializer.save()

        # Assuming 'user' is a ForeignKey in the FlatMate model
        user = flatmate.user  # Access the user associated with the flatmate

        # Create a notification for the user about the creation of their account
        notification_message = "Your account has been created successfully!"
        Notification.objects.create(user=user, message=notification_message)
    
class CreateFlatView(generics.CreateAPIView):
    queryset = Flat.objects.all()
    serializer_class = FlatSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Create the flat and associate with the user
        flat = serializer.save(created_by_username=self.request.user.username)

        # Associate the user with the flat as a flatmate and set as admin
        flatmate = FlatMate.objects.get(user=self.request.user)
        flatmate.flat = flat
        flatmate.isadmin = True
        flatmate.save()

        # Add user to leaderboard
        FlatLeaderboard.objects.create(user=self.request.user, flat=flat, score=10)

        # Create Flatez account
        account = Account.objects.create(
            username=self.request.user.username,
            accnum=self.generate_account_number(),
            bankname="Flatez Bank",
            cnic=self.generate_random_cnic(),
            balance=0.00,
            cvv=self.generate_random_cvv(),
            ccn=self.generate_random_ccn(),
            expiry_date=self.generate_expiry_date(),
        )

        # Create PartyFund account for the flat
        party_fund_account = Account.objects.create(
            username=self.request.user.username,
            accnum=self.generate_account_number(prefix="PF"),  # Unique prefix for Party Fund
            bankname="PartyFund Bank",
            cnic=self.generate_random_cnic(),
            balance=0.00,  # Initial balance
            cvv=self.generate_random_cvv(),
            ccn=self.generate_random_ccn(),
            expiry_date=self.generate_expiry_date(),
        )

    def generate_account_number(self, prefix="FLAT"):
        """Generate a unique account number with a given prefix."""
        return f"{prefix}{str(Flat.objects.count() + 1).zfill(5)}"

    def generate_random_cvv(self):
        """Generate a unique, random 3-digit CVV."""
        return str(random.randint(100, 999))

    def generate_random_ccn(self):
        """Generate a unique 16-digit credit card number."""
        while True:
            ccn = "".join(str(random.randint(0, 9)) for _ in range(16))
            if not Account.objects.filter(ccn=ccn).exists():
                return ccn

    def generate_expiry_date(self):
        """Generate an expiry date (3 years from today)."""
        return date.today().replace(year=date.today().year + 3)

    def generate_random_cnic(self):
        """Generate a random CNIC number."""
        region_code = random.randint(10000, 99999)
        unique_id = random.randint(1000000, 9999999)
        checksum = random.randint(1, 9)
        return f"{region_code}-{unique_id}-{checksum}"

class GetFlatMateDataView(generics.RetrieveAPIView):
    queryset = FlatMate.objects.all()
    serializer_class = FlatMateSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get_object(self):
        """
        This method is used to fetch the logged-in user's FlatMate data and update the score in FlatLeaderboard if exists.
        """
        user = self.request.user

        # Try to find the FlatMate entry for the logged-in user
        try:
            flatmate = FlatMate.objects.get(user=user)
        except FlatMate.DoesNotExist:
            raise NotFound({"detail": "Flatmate not found."})

        # Now, check if there's an existing entry in FlatLeaderboard for this user and flat
        try:
            leaderboard_entry = FlatLeaderboard.objects.get(user=user, flat=flatmate.flat)
            # If an entry exists, increase the score by 15
            leaderboard_entry.score += 5
            leaderboard_entry.save()  # Save the updated score
        except FlatLeaderboard.DoesNotExist:
            # If the entry doesn't exist, do nothing (or handle it if necessary)
            pass
        return flatmate  # Return the FlatMate data for the logged-in user

class JoinFlatView(generics.GenericAPIView):
    serializer_class = JoinFlatSerializer

    def post(self, request, *args, **kwargs):
        flat_name = request.data.get('flatName')
        user = request.user
        # Check if the flat exists
        try:
            flat = Flat.objects.get(name=flat_name)
        except Flat.DoesNotExist:
            raise NotFound({"detail": "Flat not found."})

        # Ensure the number of flatmates does not exceed the maximum limit
        if flat.numOfFlatmates >= 10:
            return Response({"detail": "This flat already has the maximum number of flatmates."}, status=status.HTTP_400_BAD_REQUEST)

        # Find the Flatmate associated with the logged-in user
        try:
            flatmate = FlatMate.objects.get(user=user)
            flatmate.flat = flat  # Assign the flat to the flatmate
            flatmate.save()  # Save the flatmate instance

            # Increment numOfFlatmates
            flat.numOfFlatmates += 1
            flat.save()  # Save the updated flat instance
            FlatLeaderboard.objects.create(user=self.request.user, flat=flat, score=10)

        except FlatMate.DoesNotExist:
            return Response({"detail": "Flatmate not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"detail": "You have successfully joined the flat."}, status=status.HTTP_200_OK)

class FlatDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            # Find the flatmate entry for the logged-in user
            flatmate = FlatMate.objects.get(user=user)
            flat = flatmate.flat
            
            # Prepare data to be sent to the frontend
            data = {
                "flatID": flat.id,
                "name": flat.name,
                "address": flat.address,
                "numOfFlatmates": flat.numOfFlatmates,
                "flatmates": list(
                    FlatMate.objects.filter(flat=flat)
                    .values_list("user__username", flat=True)
                ),
            }
            return Response(data, status=status.HTTP_200_OK)
        
        except FlatMate.DoesNotExist:
            return Response({"detail": "Flatmate not found."}, status=status.HTTP_404_NOT_FOUND)
        
        except Flat.DoesNotExist:
            return Response({"detail": "Flat not found."}, status=status.HTTP_404_NOT_FOUND)    
     
class CreateTaskView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can add tasks

    def post(self, request, *args, **kwargs):
        flat = None
        user = request.user
        # Ensure user is part of a flat
        try:
            flatmate = FlatMate.objects.get(user=user)
            flat = flatmate.flat
        except FlatMate.DoesNotExist:
            return Response({"detail": "You must belong to a flat to add tasks."}, status=status.HTTP_404_NOT_FOUND)

        # Get task details from the request data
        task_description = request.data.get('task')
        doer_username = request.data.get('doer')
        due_date = request.data.get('due_date')
        due_time = request.data.get('due_time')

        if not task_description or not doer_username or not due_date or not due_time:
            return Response({"detail": "All fields (task, doer, due_date, due_time) are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the assigned doer exists in the flat
        try:
            doer = User.objects.get(username=doer_username)
            doer_flatmate = FlatMate.objects.get(user=doer, flat=flat)
        except (User.DoesNotExist, FlatMate.DoesNotExist):
            return Response({"detail": "Assigned doer must be a member of the flat."}, status=status.HTTP_404_NOT_FOUND)

        # Create the task
        task_data = {
            'flat': flat.id,
            'task': task_description,
            'doer': doer.id,
            'due_date': due_date,
            'due_time': due_time,
        }
        serializer = AddTaskSerializer(data=task_data)

        # Notifications
        notification_message_for_creator = "You created a task!"
        Notification.objects.create(user=user, message=notification_message_for_creator)

        notification_message_for_doer = f"You have been assigned a new task: {task_description}"
        Notification.objects.create(user=doer, message=notification_message_for_doer)

        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Task added successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
class FlatLeaderboardView(generics.ListAPIView):
    serializer_class = FlatLeaderboardSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get_queryset(self):
        """
        Restricts the returned leaderboard to the given user's flat.
        """
        # Get the logged-in user
        user = self.request.user

        # Get the flat of the logged-in user by looking up the Flatemate model
        # Assuming the Flatemate model has a ForeignKey to Flat and User
        flatmate = FlatMate.objects.filter(user=user).first()  # Get the first match (assuming user can have only one flat)

        if flatmate is None:
            # If no flatmate record is found, you might want to handle this case
            # Return an empty queryset or raise an error, based on your requirements
            return FlatLeaderboard.objects.none()

        # Get the flat associated with this flatmate
        user_flat = flatmate.flat

        # Return the leaderboard entries where the flat matches the logged-in user's flat
        queryset = FlatLeaderboard.objects.filter(flat=user_flat).order_by('-score')
        print(queryset)
        return queryset
    
class PendingLoansView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get(self, request, *args, **kwargs):
        user = request.user  # Get the logged-in user

        # Ensure the user is authenticated
        if not user.is_authenticated:
            return Response({"detail": "Authentication is required."}, status=status.HTTP_401_UNAUTHORIZED)

        # Filter loans where the logged-in user is the sender and status is pending
        pending_loans = Loan.objects.filter(sender=user, status='pending')

        # Fetch usernames for sender and recipient
        loan_data = []
        for loan in pending_loans:
            sender_username = loan.sender.username
            recipient_username = loan.recipient.username
            loan_data.append({
                "id": loan.id,
                "amount": loan.amount,
                "status": loan.status,
                "sender_username": sender_username,
                "recipient_username": recipient_username,
            })

        # Return the processed loan data
        return Response(loan_data, status=status.HTTP_200_OK)
      
class SubmitGameScoreView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def post(self, request, *args, **kwargs):
        score = request.data.get('score')  # Get the score from the request body

        if score is None:
            return Response({"detail": "Score is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user already has a game entry
        user_game = Game.objects.filter(username=request.user.username).first()

        if user_game:
            # If the user has a game entry, update their score
            user_game.score += score
            user_game.save()
            return Response({"detail": "Score updated successfully."}, status=status.HTTP_200_OK)
        else:
            # If no entry exists, create a new game entry
            game_data = {
                'username': request.user.username,
                'score': score
            }

            serializer = GameSerializer(data=game_data)

            if serializer.is_valid():
                serializer.save()  # Save the game entry
                return Response({"detail": "Score submitted successfully."}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                      
class GameLeaderboardView(generics.ListAPIView):
    """
    View to get all leaderboard entries.
    Only authenticated users can access this view.
    """
    queryset = Game.objects.all().order_by('-score')  # Sort by score in descending order
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]  # Ensure that only authenticated users can access the leaderboard
    
    def get(self, request, *args, **kwargs):
        """
        Get all leaderboard entries and return them.
        """
        leaderboard = self.get_queryset()  # Get the leaderboard entries
        
        # Serialize the data and return the response
        serializer = self.get_serializer(leaderboard, many=True)
        return Response(serializer.data)            
     
class CreateChatMessageView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can send messages

    def post(self, request, *args, **kwargs):
        message = request.data.get('message')  # Get the message from the request
        user = request.user  # Get the logged-in user
        
        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the FlatMate entry for the logged-in user
            flatmate = FlatMate.objects.get(user=user)
            flat = flatmate.flat  # Get the flat associated with the user
        except FlatMate.DoesNotExist:
            return Response({"detail": "Flatmate not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Create the Chat message associated with the user and flat
        chat_message = Chat.objects.create(
            user=user,
            flat=flat,
            message=message
        )
        
        # Serialize the chat message (optional)
        serializer = ChatSerializer(chat_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)    
    
class GetChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can view messages

    def get(self, request, *args, **kwargs):
        user = request.user  # Get the logged-in user
        
        try:
            # Get the FlatMate entry for the logged-in user
            flatmate = FlatMate.objects.get(user=user)
            flat = flatmate.flat  # Get the flat associated with the user
        except FlatMate.DoesNotExist:
            return Response({"detail": "Flatmate not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get other users in the same flat (excluding the logged-in user)
        flatmates_in_flat = FlatMate.objects.filter(flat=flat).exclude(user=user)  # Exclude the logged-in user
        users_in_flat = [flatmate.user for flatmate in flatmates_in_flat]  # Get the users associated with those FlatMate entries
        
        # Get all chat messages for the flat, ordered by timestamp
        messages = Chat.objects.filter(flat=flat).order_by('-timestamp')
        
        # Serialize all the messages
        messages_data = [{
            'username': message.user.username,
            'message': message.message,
            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for message in messages]

        # Create a list of users in the flat (excluding the logged-in user)
        users_data = [{'username': user.username} for user in users_in_flat]

        # Send the serialized chat messages, list of users, and logged-in username to the frontend
        return Response({
            'loggedna_in_userme': user.username,  # Add the logged-in username to the response
            'users': users_data,  # List of users in the flat
            'messages': messages_data  # All chat messages in the flat
        }, status=status.HTTP_200_OK)
              
class UserNotificationView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get_queryset(self):
        """
        Restricts the returned notifications to the logged-in user.
        """
        user = self.request.user  # Get the logged-in user
        # Filter notifications belonging to the user
        queryset = Notification.objects.filter(user=user).order_by('-created_at')  # Assuming a created_at field
        return queryset        

class GetAllTasksView(generics.ListAPIView):
    """
    View to get all tasks for the logged-in user.
    Only authenticated users can access this view.
    """
    serializer_class = AddTaskSerializer
    permission_classes = [IsAuthenticated]  # Ensure that only authenticated users can access this view

    def get_queryset(self):
        """
        Restrict the returned tasks to the logged-in user's flat,
        only include tasks that are not done, and ensure the logged-in user is the doer.
        """
        user = self.request.user

        # Get the flatmate entry for the logged-in user
        try:
            flatmate = FlatMate.objects.get(user=user)
        except FlatMate.DoesNotExist:
            return Task.objects.none()  # If no flatmate record is found, return an empty queryset

        # Get the flat associated with this flatmate
        user_flat = flatmate.flat

        # Return only tasks that are not done and where the logged-in user is the doer
        return Task.objects.filter(flat=user_flat, done=False, doer=user).order_by('due_date', 'due_time')  # Optionally, order tasks by due date and time

    def list(self, request, *args, **kwargs):
        """
        List all tasks for the logged-in user's flat that are not done and where the logged-in user is the doer.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
  
class MarkTaskAsDoneView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Assuming the task is sent as part of the request body
            task_data = request.data
            # Find the task by its ID
            task = Task.objects.get(id=task_data['id'])
            
            # Check if the task is already done
            if task.done:
                return Response({"error": "Task is already marked as done."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark the task as done
            task.done = True
            task.save()
            
            # Return a success response
            return Response({"message": "Task marked as done successfully."}, status=status.HTTP_200_OK)
        
        except Task.DoesNotExist:
            # If the task does not exist, return a 404 error
            raise NotFound(detail="Task not found.")
     
class GetChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can view messages

    def get(self, request, *args, **kwargs):
        user = request.user  # Get the logged-in user
        
        try:
            # Get the FlatMate entry for the logged-in user
            flatmate = FlatMate.objects.get(user=user)
            flat = flatmate.flat  # Get the flat associated with the user
        except FlatMate.DoesNotExist:
            return Response({"detail": "Flatmate not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get other users in the same flat (excluding the logged-in user)
        flatmates_in_flat = FlatMate.objects.filter(flat=flat).exclude(user=user)  # Exclude the logged-in user
        users_in_flat = [flatmate.user for flatmate in flatmates_in_flat]  # Get the users associated with those FlatMate entries
        
        # Get all chat messages for the flat, ordered by timestamp
        messages = Chat.objects.filter(flat=flat).order_by('-timestamp')
        
        # Serialize all the messages
        messages_data = [{
            'username': message.user.username,
            'message': message.message,
            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for message in messages]

        # Create a list of users in the flat (excluding the logged-in user)
        users_data = [{'username': user.username} for user in users_in_flat]

        # Send the serialized chat messages, list of users, and logged-in username to the frontend
        return Response({
            'loggedna_in_userme': user.username,  # Add the logged-in username to the response
            'users': users_data,  # List of users in the flat
            'messages': messages_data  # All chat messages in the flat
        }, status=status.HTTP_200_OK)
    
class RequestLoanView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the receiver is logged in

    def post(self, request, *args, **kwargs):
        # Get the sender's username and the loan amount from the frontend
        sender_username = request.data.get('username')
        amount = request.data.get('amount')
        due_date = request.data.get('due_date')  # Get the due date from the request

        if not sender_username or not amount or not due_date:
            return Response({"error": "Sender username, amount, and due date are required."}, 
                             status=status.HTTP_400_BAD_REQUEST)

        # Get the logged-in user's username (receiver)
        receiver = request.user  # Receiver is the logged-in user
        receiver_flatmate = FlatMate.objects.filter(user=receiver).first()

        if not receiver_flatmate:
            return Response({"error": "Receiver account does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the sender's User instance using the sender's username
            sender_user = User.objects.get(username=sender_username)
            sender_flatmate = FlatMate.objects.get(user=sender_user)

            # Ensure the sender and receiver are not the same
            if sender_user == receiver:
                return Response({"error": "Sender and receiver cannot be the same."}, 
                                 status=status.HTTP_400_BAD_REQUEST)

            # Ensure the sender and receiver have account numbers
            if not sender_flatmate.accnum or not receiver_flatmate.accnum:
                return Response({"error": "Both sender and receiver must have valid account numbers."}, 
                                 status=status.HTTP_400_BAD_REQUEST)

            # Ensure the amount is a valid positive number
            if float(amount) <= 0:
                return Response({"error": "The loan amount must be a positive value."}, 
                                 status=status.HTTP_400_BAD_REQUEST)

            # Ensure the due date is not in the past
            if date.fromisoformat(due_date) < date.today():
                return Response({"error": "The due date cannot be in the past."}, 
                                 status=status.HTTP_400_BAD_REQUEST)

            # Create the Loan object and store the loan details
            loan = Loan.objects.create(
                sender=sender_user,
                recipient=receiver,  # Receiver is the logged-in user
                amount=amount,
                due_date=due_date,
                status='pending'  # Assuming the loan isn't paid initially
            )

            # Create notifications for both sender and receiver
            notification_message_sender = f"You have received a loan request of {amount} Rs from {receiver.username}."
            notification_message_receiver = f"You have sent a loan request of {amount} Rs to {sender_user.username}."

            # Create Notification objects
            Notification.objects.create(user=sender_user, message=notification_message_sender)
            Notification.objects.create(user=receiver, message=notification_message_receiver)

            return Response({"message": "Loan request created successfully!"}, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({"error": "Sender not found."}, status=status.HTTP_404_NOT_FOUND)

        except FlatMate.DoesNotExist:
            return Response({"error": "Sender's flatmate account does not exist."}, status=status.HTTP_404_NOT_FOUND)

class AccountDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Assuming flatmate has a relation to Account (via the accnum field)
        try:
            flatmate = FlatMate.objects.get(user=user)
            account = Account.objects.get(accnum=flatmate.accnum)
            serializer = AccountSerializer(account)
            return Response(serializer.data, status=200)
        except FlatMate.DoesNotExist:
            return Response({"detail": "Flatmate not found."}, status=404)
        except Account.DoesNotExist:
            return Response({"detail": "Account not found."}, status=404)
   
def transfer_funds(sender_account, recipient_account, amount):
    """Helper function to transfer funds between two accounts using a custom Transaction model."""
    print("Checking balance...")
    if sender_account.balance >= amount:
        try:
            with transaction.atomic():  # Ensure atomicity
                print("Transferring funds...")
                
                # Deduct from sender and add to recipient
                sender_account.balance -= amount
                recipient_account.balance += amount

                # Save the updated balances
                sender_account.save()
                recipient_account.save()

                # Create a record in your custom Transaction model
                Transaction.objects.create(
                    sender=sender_account,
                    receiver=recipient_account,
                    amount=amount
                )
                
            print("Transaction successful.")
            return True
        except Exception as e:
            print(f"Transaction error: {e}")
            return False
    else:
        print("Insufficient balance.")
        return False

class ProcessLoanTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        loan_id = request.data.get("loan_id")
        print(f"Loan ID received: {loan_id}")

        action = request.data.get("action")  # Handle "accept" or "reject"
        print(f"action: {action}")
        if not loan_id:
            return Response({"detail": "Loan ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        if action not in ["accept", "reject"]:
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            loan = Loan.objects.get(id=loan_id)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found."}, status=status.HTTP_404_NOT_FOUND)

        sender = loan.sender
        recipient = loan.recipient
        print(sender,recipient)
        try:
            sender_flatmate = FlatMate.objects.get(user=sender)
            recipient_flatmate = FlatMate.objects.get(user=recipient)
            print(sender_flatmate,recipient_flatmate)
        except FlatMate.DoesNotExist:
            return Response({"detail": "FlatMate not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            sender_account = Account.objects.get(accnum=sender_flatmate.accnum)
            recipient_account = Account.objects.get(accnum=recipient_flatmate.accnum)
            print(sender_account)
        except Account.DoesNotExist:
            return Response({"detail": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "accept":
            loan_amount = loan.amount
            try:
                if transfer_funds(sender_account, recipient_account, loan_amount):
                    loan.status = "accepted"
                    loan.save()
                    return Response({"detail": "Loan accepted. Transaction successful."}, status=status.HTTP_200_OK)
                else:
                    loan.status = "rejected"
                    loan.save()
                    return Response({"detail": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif action == "reject":
            loan.status = "rejected"
            loan.save()
            return Response({"detail": "Loan rejected."}, status=status.HTTP_200_OK)
           
class LoanHistoryView(generics.ListAPIView):
    """
    View to get all loan entries with status 'accepted' and 'rejected'.
    Only authenticated users can access this view.
    """
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]  # Ensure that only authenticated users can access the loan history

    def get_queryset(self):
        """
        Filter loans where the logged-in user is either the sender or the receiver,
        and the loan status is either 'accepted' or 'rejected'.
        """
        user = self.request.user  # Get the currently logged-in user
        sender_loans = Loan.objects.filter(
            status__in=['accepted', 'rejected'],  # Only 'accepted' or 'rejected' loans
            sender=user  # Check if the logged-in user is the sender
        )
        recipient_loans = Loan.objects.filter(
            status__in=['accepted', 'rejected'],  # Only 'accepted' or 'rejected' loans
            recipient=user  # Check if the logged-in user is the recipient
        )

        # Combine both querysets and sort by loan_date (after combining)
        combined_loans = sender_loans | recipient_loans
        return combined_loans.order_by('-loan_date')  # Now order the combined queryset

    def get(self, request, *args, **kwargs):
        """
        Get all loan entries where the logged-in user is either the sender or the recipient,
        and return them.
        """
        loans = self.get_queryset()  # Get the filtered loans
        
        # Serialize the data and return the response
        serializer = self.get_serializer(loans, many=True)
        return Response(serializer.data)
    
class AddSharedExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Get the logged-in user's flat
        try:
            user_flatmate = request.user.flatmate  # Assumes the FlatMate has a one-to-one relationship with User
            if not user_flatmate.flat:
                raise ValidationError("You are not associated with any flat.")
            flat = user_flatmate.flat
        except FlatMate.DoesNotExist:
            return Response({"errors": "User is not a flatmate or does not belong to any flat."}, status=status.HTTP_400_BAD_REQUEST)

        # Extract data from request and add the flat to the expense
        data = request.data.copy()  # Make a mutable copy of request data
        data['flat'] = flat.id  # Associate the expense with the flat ID

        serializer = SharedExpenseSerializer(data=data)
        if serializer.is_valid():
            # Save the shared expense to the database
            serializer.save()
            return Response({"message": "Shared expense added successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)
        
        # Return errors if validation fails
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ViewSharedExpensesView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retrieve all SharedExpenses where:
        - The logged-in user is associated with the flat.
        - The due date is not in the past.
        - The expense is unpaid.
        """
        user = self.request.user  # Get the currently logged-in user
        
        try:
            # Retrieve the FlatMate for the logged-in user
            user_flatmate = user.flatmate
            if not user_flatmate.flat:
                return SharedExpense.objects.none()  # Return an empty queryset if the user is not associated with any flat
            
            flat = user_flatmate.flat
        except user.flatmate.RelatedObjectDoesNotExist:
            return SharedExpense.objects.none()  # Return an empty queryset if user is not a flatmate

        # Get the current date and time to compare with due dates
        current_datetime = timezone.now()

        # Filter shared expenses for the flat the user belongs to
        # The conditions: expense is not paid, the due date is not in the past
        shared_expenses = SharedExpense.objects.filter(
            flat=flat,
            is_paid=False,
            due_date__gte=current_datetime.date(),  # Filter by due date (greater than or equal to today's date)
            due_time__gte=current_datetime.time()  # Filter by due time (greater than or equal to current time today)
        )
        
        return shared_expenses

    def get(self, request, *args, **kwargs):
        """
        Get all shared expenses for the logged-in user's flat that are:
        - Not paid
        - Have a due date that is not in the past
        """
        shared_expenses = self.get_queryset()  # Get the filtered shared expenses
        
        # Serialize the data
        serializer = SharedExpenseSerializer(shared_expenses, many=True)
        
        # Return the serialized data as a response
        return Response({"expenses": serializer.data}, status=status.HTTP_200_OK)

class SharedPaymentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Handles shared payments from the authenticated user to the admin's FlatEz account.
        """
        user = request.user

        # Fetch the FlatMate entry for the authenticated user
        try:
            flatmate = FlatMate.objects.get(user=user)
        except FlatMate.DoesNotExist:
            raise NotFound({"detail": "Flatmate not found."})

        # Validate if the FlatMate has an associated account
        if not flatmate.accnum:
            raise ValidationError({"detail": "No account associated with this user."})
        print(flatmate)

        # Fetch the Flat associated with the FlatMate
        flat = flatmate.flat
        if not flat:
            raise ValidationError({"detail": "User is not associated with any flat."})

        # Fetch the admin's username from the Flat model
        admin_username = flat.created_by_username
        print(admin_username)
        if not admin_username:
            raise ValidationError({"detail": "Flat does not have an admin assigned."})

        # Get admin's FlatEz account from the Account model using admin_username
        try:
            flat_ez_account = Account.objects.get(username=admin_username, bankname='Flatez Bank')
        except Account.DoesNotExist:
            raise NotFound({"detail": "FlatEz account not found for the admin."})
        print(flat_ez_account)

        # Get the shared cost from the Flat
        shared_cost = flat.shared_cost
        if shared_cost <= 0:
            raise ValidationError({"detail": "Invalid shared cost."})

        # Fetch the user's account from the Account model
        try:
            user_account = Account.objects.get(accnum=flatmate.accnum)
        except Account.DoesNotExist:
            raise NotFound({"detail": "User's account not found."})

        # Perform the transaction using the shared cost
        print(f"User Account: {user_account}, FlatEz Account: {flat_ez_account}, Amount: {shared_cost}")
        if transfer_funds(user_account, flat_ez_account, shared_cost):
            flatmate.isPaid = True
            flatmate.save()  # Save the updated FlatMate instance
            return Response({"detail": "Payment successful."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Transaction failed."}, status=status.HTTP_400_BAD_REQUEST)
        
class UserTransactionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]  # Ensures the user is authenticated

    def get_queryset(self):
        # Get the logged-in user's flatmate profile
        try:
            flatmate = FlatMate.objects.get(user=self.request.user)
        except FlatMate.DoesNotExist:
            return Transaction.objects.none()
        print(flatmate)
        # Get the Account associated with the flatmate
        accountnum = FlatMate.objects.get(user=self.request.user).accnum
        print(123123213,accountnum)
        try:
            account = Account.objects.get(accnum=accountnum)
            print(1213,account)
        except Account.DoesNotExist:
            return Transaction.objects.none()

        # Return transactions where the user is either the sender or the receiver
        return Transaction.objects.filter(
            sender=account
        ) | Transaction.objects.filter(
            receiver=account
        )

    def get_serializer_class(self):
        return TransactionSerializer  # Use the updated TransactionSerializer
    
class AddPartyFundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Get the logged-in user's flat
        try:
            user_flatmate = request.user.flatmate  # Assumes the FlatMate has a one-to-one relationship with User
            if not user_flatmate.flat:
                raise ValidationError("You are not associated with any flat.")
            flat = user_flatmate.flat
        except FlatMate.DoesNotExist:
            return Response({"errors": "User is not a flatmate or does not belong to any flat."}, status=status.HTTP_400_BAD_REQUEST)

        # Extract data from request body
        purpose = request.data.get("purpose")
        amount = request.data.get("amount")
        member_usernames = request.data.get("members", [])

        # Validate the required fields
        if not purpose or not amount or not member_usernames:
            return Response({"errors": "Purpose, amount, and members are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)  # Ensure the amount is a valid number
        except ValueError:
            return Response({"errors": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"errors": "Amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the users based on the usernames
        members = User.objects.filter(username__in=member_usernames)

        # Ensure all members belong to the same flat
        invalid_members = []
        for member in members:
            try:
                member_flatmate = member.flatmate
                if member_flatmate.flat != flat:
                    invalid_members.append(member.username)
            except FlatMate.DoesNotExist:
                invalid_members.append(member.username)

        if invalid_members:
            return Response(
                {"errors": f"The following members do not belong to your flat: {', '.join(invalid_members)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prepare the data for creating the party fund
        data = {
            "purpose": purpose,
            "amount": amount,
            "flat": flat.id,  # Add the user's flat to the fund
            "members": [member.id for member in members],  # Convert member User objects to their IDs
        }

        # Serialize the data and create the Party Fund
        serializer = PartyFundSerializer(data=data)
        if serializer.is_valid():
            # Save the new party fund to the database
            party_fund = serializer.save()

            # Create notifications for each member
            for member in members:
                message = f"A new party fund has been created for '{purpose}' with an amount of {amount}."
                Notification.objects.create(user=member, message=message)

            return Response({
                "message": "Party fund created successfully and notifications sent!",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        # Return errors if validation fails
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
class PartyFundListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the logged-in user
        user = request.user

        # Find all party funds where the user is a member
        party_funds = PartyFund.objects.filter(members=user,is_paid = False)

        # If no party funds are found
        if not party_funds:
            return Response({"message": "You are not a member of any party fund."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the party funds data
        serializer = PartyFundSerializer(party_funds, many=True)

        # Return the serialized data in the response
        return Response({"party_funds": serializer.data}, status=status.HTTP_200_OK)
    
class PayExpenseView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Handles shared payments from the authenticated user to the admin's FlatEz account.
        """
        user = request.user
        # Fetch the FlatMate entry for the authenticated user
        expense_id = request.data.get('expense_id')  # Get the expense ID
        expense = SharedExpense.objects.get(id=expense_id)
        expense_cost=expense.amount
        expense_desc = expense.description
        try:
            flatmate = FlatMate.objects.get(user=user)
        except FlatMate.DoesNotExist:
            raise NotFound({"detail": "Flatmate not found."})

        # Validate if the FlatMate has an associated account
        if not flatmate.accnum:
            raise ValidationError({"detail": "No account associated with this user."})

        # Fetch the Flat associated with the FlatMate
        flat = flatmate.flat
        if not flat:
            raise ValidationError({"detail": "User is not associated with any flat."})

        # Fetch the admin's username from the Flat model
        admin_username = flat.created_by_username
        if not admin_username:
            raise ValidationError({"detail": "Flat does not have an admin assigned."})
        # Get admin's FlatEz account from the Account model using admin_username
        try:
            bill_account = Account.objects.get(username=expense_desc)
        except Account.DoesNotExist:
            raise NotFound({"detail": "PartyFund account not found for the admin."})

        try:
            flat_ez_account = Account.objects.get(username=admin_username, bankname='Flatez Bank')
        except Account.DoesNotExist:
            raise NotFound({"detail": "FlatEz account not found for the admin."})
        
        expense = SharedExpense.objects.get(id = expense_id)

        # Fetch the user's account from the Account model
        try:
            user_account = Account.objects.get(accnum=flatmate.accnum)
        except Account.DoesNotExist:
            raise NotFound({"detail": "User's account not found."})

        # Perform the transaction using the shared cost
        print(f"User Account: {flat_ez_account}, PartyFund Account: {bill_account}, Amount: {expense_cost}")
        if transfer_funds(flat_ez_account, bill_account, expense_cost):
            expense.is_paid = True
            expense.save()
            return Response({"detail": "Payment successful."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Transaction failed."}, status=status.HTTP_400_BAD_REQUEST)

class PayPartyFundView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Handles shared payments from the authenticated user to the admin's FlatEz account.
        """
        user = request.user
        # Fetch the FlatMate entry for the authenticated user
        fund_id = request.data.get('fund_id')
        try:
            flatmate = FlatMate.objects.get(user=user)
        except FlatMate.DoesNotExist:
            raise NotFound({"detail": "Flatmate not found."})

        # Validate if the FlatMate has an associated account
        if not flatmate.accnum:
            raise ValidationError({"detail": "No account associated with this user."})

        # Fetch the Flat associated with the FlatMate
        flat = flatmate.flat
        if not flat:
            raise ValidationError({"detail": "User is not associated with any flat."})

        # Fetch the admin's username from the Flat model
        admin_username = flat.created_by_username
        if not admin_username:
            raise ValidationError({"detail": "Flat does not have an admin assigned."})
        
        # Get admin's FlatEz account from the Account model using admin_username
        try:
            partyfund_account = Account.objects.get(username=admin_username, bankname='PartyFund Bank')
        except Account.DoesNotExist:
            raise NotFound({"detail": "PartyFund account not found for the admin."})

        partyfund = PartyFund.objects.get(id=fund_id)

        # Get the shared cost from the Flat
        shared_cost = partyfund.per_person_cost
        if shared_cost <= 0:
            raise ValidationError({"detail": "Invalid shared cost."})

        # Fetch the user's account from the Account model
        try:
            user_account = Account.objects.get(accnum=flatmate.accnum)
        except Account.DoesNotExist:
            raise NotFound({"detail": "User's account not found."})

        # Perform the transaction using the shared cost
        print(f"User Account: {user_account}, PartyFund Account: {partyfund_account}, Amount: {shared_cost}")
        if transfer_funds(user_account, partyfund_account, shared_cost):
            partyfund.amount = partyfund.amount - shared_cost
            partyfund.members.remove(user)
            if partyfund.amount == 0:
                partyfund.is_paid = True
            partyfund.save()

            # Create a notification for the user who made the payment
            Notification.objects.create(
                user=user,
                message=f"Payment of {shared_cost} to Party Fund was successful."
            )

            # Create notifications for all flatmates in the same flat
            flatmates = FlatMate.objects.filter(flat=flat).exclude(user=user)  # Exclude the paying user
            for flatmate in flatmates:
                Notification.objects.create(
                    user=flatmate.user,
                    message=f"User {user.username} made a payment of {shared_cost} to the Party Fund."
                )

            return Response({"detail": "Payment successful."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Transaction failed."}, status=status.HTTP_400_BAD_REQUEST)

class LeaveFlatView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        accnum = request.data.get('accnum')

        # Ensure 'accnum' is provided
        if not accnum:
            raise ValidationError({"detail": "Account number is required."})

        try:
            flatmate = FlatMate.objects.get(user=user, accnum=accnum)
        except FlatMate.DoesNotExist:
            raise NotFound({"detail": "FlatMate with this account not found."})

        # Ensure the FlatMate is associated with a flat
        if not flatmate.flat:
            raise ValidationError({"detail": "You are not associated with any flat."})

        # Remove FlatMate from flat
        flat = flatmate.flat
        flatmate.flat = None
        flatmate.save()

        # Get the username of the authenticated user
        username = user.username
        print(username)
        
        # Delete the user's entry from the FlatLeaderboard model
        try:
            leaderboard_entry = FlatLeaderboard.objects.get(flat=flat, user=user)
            leaderboard_entry.delete()  # Remove user from leaderboard
        except FlatLeaderboard.DoesNotExist:
            pass  # If there's no entry for this user, just ignore

        # Notify the user about successful flat leaving
        return Response({"detail": "You have successfully left the flat."}, status=status.HTTP_200_OK) 
    
class UpdateFlatMateProfileView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    serializer_class = FlatMateSerializer

    def get_object(self):
        """
        Returns the FlatMate object for the currently authenticated user.
        """
        try:
            return FlatMate.objects.get(user=self.request.user)
        except FlatMate.DoesNotExist:
            raise ValidationError({"detail": "FlatMate profile not found."})

    def put(self, request, *args, **kwargs):
        """
        Handle the PUT request to update the FlatMate and User profile.
        """
        flatmate = self.get_object()  # Fetch the current FlatMate profile
        user = self.request.user  # Get the associated User object

        # Handle fields for both User and FlatMate models
        flatmate_data = request.data.copy()  # Copy the data to update FlatMate
        user_data = {}  # Dictionary to hold updated User fields

        # If a new password is provided, handle the password update for the User model
        new_password = request.data.get("newPassword", None)
        if new_password:
            user_data["password"] = new_password

        # Validate and update the FlatMate profile using the serializer
        flatmate_serializer = self.get_serializer(flatmate, data=flatmate_data, partial=True)
        user_serializer = UserSerializer(user, data=user_data, partial=True)

        # Check if both serializers are valid
        if flatmate_serializer.is_valid() and user_serializer.is_valid():
            # Save the updated data to the database
            flatmate_serializer.save()

            # If the password is updated, handle the password change in the User model
            if new_password:
                user.set_password(new_password)  # Update the User's password
                print(f"New password: {new_password}")  # Debugging: confirm password change
                user.save()  # Save the User after setting the new password
                print(f"Password updated for {user.username}")  # Confirm password update
                update_session_auth_hash(request, user)  # Prevent logout after password change

            user_serializer.save()  # Save the User model changes

            return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)

        # Return errors if either serializer is invalid
        return Response(
            {
                "detail": "Invalid data",
                "errors": flatmate_serializer.errors + user_serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )     
        
class DeleteExpenseView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """
        Handles the deletion of a shared expense.
        """
        expense_id = request.data.get('expense_id')  # Get the expense ID
        
        try:
            expense = SharedExpense.objects.get(id=expense_id)
        except SharedExpense.DoesNotExist:
            raise NotFound({"detail": "Expense not found."})

        if expense.is_paid:
            raise ValidationError({"detail": "Cannot delete a paid expense."})

        # Delete the expense
        expense.delete()

        # Return success response
        return Response({"detail": "Expense deleted successfully."}, status=status.HTTP_200_OK)        
    
class EditSharedExpenseView(generics.UpdateAPIView):
    queryset = SharedExpense.objects.all()
    serializer_class = SharedExpenseSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # Look for the 'id' parameter in the URL

    def update(self, request, *args, **kwargs):
        expense = self.get_object()  # Fetch the SharedExpense object by ID
        serializer = self.get_serializer(expense, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()  # Save the updated expense
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)