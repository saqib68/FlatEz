from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *
from django.contrib.auth import update_session_auth_hash

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)  # Create the user
        return user

    def validate_password(self, value):
        # If password is being updated, remove constraints (no validation here)
        return value

class FlatMateSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested User Serializer

    class Meta:
        model = FlatMate
        fields = ['firstName', 'lastName', 'email', 'dob', 'contact', 'flat', 'user','isadmin','accnum','isPaid']

    def create(self, validated_data):
        user_data = validated_data.pop('user')  # Separate user data
        user = User.objects.create_user(**user_data)  # Create the user first
        flatmate = FlatMate.objects.create(user=user, **validated_data)  # Create the flatmate instance
        return flatmate

class FlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = ['id', 'name', 'address', 'created_by_username', 'shared_cost', 'numOfFlatmates']
        read_only_fields = ['id', 'created_by_username']

    def validate_numOfFlatmates(self, value):
        if not isinstance(value, int) or value < 1:
            raise serializers.ValidationError("Number of flatmates must be a positive integer.")
        return value


class JoinFlatSerializer(serializers.Serializer):
    flatName = serializers.CharField(max_length=255)

class FlatLeaderboardSerializer(serializers.ModelSerializer):
    flat_name = serializers.SerializerMethodField()  # For flat name
    user_username = serializers.SerializerMethodField()  # For user username

    class Meta:
        model = FlatLeaderboard
        fields = ['user_username', 'score', 'flat_name']  # Include the custom fields

    def get_flat_name(self, obj):
        """
        Custom method to return the flat name for this leaderboard entry.
        """
        # Assuming you have a related field `flat` in FlatLeaderboard model
        return obj.flat.name if obj.flat else None

    def get_user_username(self, obj):
        """
        Custom method to return the username for this leaderboard entry.
        """
        # Assuming you have a related field `user` in FlatLeaderboard model
        return obj.user.username if obj.user else None
  
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['username', 'score']

    def create(self, validated_data):
        # Create and return a new Game instance with validated data
        return Game.objects.create(**validated_data)

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['message']

class AddTaskSerializer(serializers.ModelSerializer):
    flat_name = serializers.SerializerMethodField()  # Custom field for flat name
    doer_username = serializers.SerializerMethodField()  # Custom field for doer username

    class Meta:
        model = Task
        fields = ['id', 'flat', 'flat_name', 'task', 'doer', 'doer_username', 'due_date', 'due_time', 'created_at']
        read_only_fields = ['created_at', 'updated_at']  # Read-only fields

    def get_flat_name(self, obj):
        """Return the name of the flat associated with the task."""
        return obj.flat.name if obj.flat else None

    def get_doer_username(self, obj):
        """Return the username of the user assigned as the doer of the task."""
        return obj.doer.username if obj.doer else None

    def create(self, validated_data):
        """Create a new AddTask instance."""
        return Task.objects.create(**validated_data)
    
class NotificationSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()  # Custom field for the user's username

    class Meta:
        model = Notification
        fields = ['id', 'user', 'user_username', 'message']  # Include all required fields

    def get_user_username(self, obj):
        """
        Custom method to return the username for the related user.
        """
        return obj.user.username if obj.user else None
       
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'  # Include all fields from the Account model
        read_only_fields = ('accnum', 'cnic', 'ccn', 'expiry_date', 'cvv')  # Optionally, make sensitive fields read-only    
    
class LoanSerializer(serializers.ModelSerializer):
    # Adding custom fields for sender and recipient usernames
    sender_username = serializers.SerializerMethodField()
    recipient_username = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = ['id', 'sender', 'recipient', 'amount', 'loan_date', 'due_date', 'status', 'sender_username', 'recipient_username']

    def get_sender_username(self, obj):
        return obj.sender.username  # Fetch the username of the sender

    def get_recipient_username(self, obj):
        return obj.recipient.username  # Fetch the username of the recipient

class TransactionSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)
    receiver_display_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['sender_name', 'receiver_name', 'amount', 'receiver_display_name', 'datetime']

    def get_receiver_display_name(self, obj):
        # Check if receiver's bank is 'Flatez Bank'
        if obj.receiver.bankname == 'Flatez Bank':
            return 'FlatEZ Account'
        return obj.receiver.username  # Default to the receiver's username

class SharedExpenseSerializer(serializers.ModelSerializer):
    flat_name = serializers.SerializerMethodField()

    class Meta:
        model = SharedExpense
        fields = ['id', 'flat', 'flat_name', 'description', 'amount', 'due_date', 'due_time', 'is_paid']
        read_only_fields = ['id']

    def get_flat_name(self, obj):
        return obj.flat.name if obj.flat else None

    def update(self, instance, validated_data):
        instance.description = validated_data.get('description', instance.description)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.due_time = validated_data.get('due_time', instance.due_time)
        instance.is_paid = validated_data.get('is_paid', instance.is_paid)
        
        # Add validation for due_date and due_time
        if instance.due_date < date.today() or (instance.due_date == date.today() and instance.due_time < datetime.now().time()):
            raise serializers.ValidationError("Expense due date and time cannot be in the past.")

        instance.save()
        return instance

class PartyFundSerializer(serializers.ModelSerializer):
    # The 'members' field will be a list of user IDs
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)

    class Meta:
        model = PartyFund
        fields = ['id', 'purpose', 'amount', 'flat', 'members', 'created_at', 'is_paid', 'per_person_cost']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        # Create the PartyFund instance
        party_fund = PartyFund.objects.create(**validated_data)
        
        # Add the members to the PartyFund instance
        party_fund.members.set(members)

        # Calculate the per_person_cost and save it
        num_members = len(members)
        if num_members > 0:
            party_fund.per_person_cost = party_fund.amount / num_members
            party_fund.save()

        return party_fund

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        # Update the PartyFund instance with new validated data
        instance.purpose = validated_data.get('purpose', instance.purpose)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.flat = validated_data.get('flat', instance.flat)
        instance.is_paid = validated_data.get('is_paid', instance.is_paid)

        if members is not None:
            instance.members.set(members)
        
        # Recalculate the per_person_cost after the update
        num_members = len(instance.members.all())
        if num_members > 0:
            instance.per_person_cost = instance.amount / num_members
        else:
            instance.per_person_cost = 0
        instance.save()

        return instance