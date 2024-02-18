import { Request, Response } from 'express';
import { createContact, findContactByEmailOrPhone, updateContact, consolidateContacts } from '../utils/contactUtils';

// Define interfaces for better type checking and clarity
interface Contact {
    id: number;
    email: string | null;
    phoneNumber: string | null;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: Date; // Assuming createdAt is a Date object
}

interface ConsolidatedContactResponse {
    // contact: {
    primaryContactId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    // };
}

export const identifyHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, phoneNumber } = req.body;

    try {
        console.log('email', email)
        const existingContactsByEmail: Contact[] = email ? await findContactByEmailOrPhone(email, "") : [];
        const existingContactsByPhone: Contact[] = phoneNumber ? await findContactByEmailOrPhone("", phoneNumber) : [];
        const allExistingContacts: Contact[] = [...new Set([...existingContactsByEmail, ...existingContactsByPhone])]; // Ensure uniqueness
        console.log('here', );
        let primaryContact: Contact | undefined;

        if (allExistingContacts.length > 0) {
            // Find any existing primary contact
            primaryContact = allExistingContacts.find(contact => contact.linkPrecedence === 'primary');

            if (primaryContact) {
                // Handle case where existing primary might become secondary
                const isNewInformation = (email && primaryContact.email !== email) || (phoneNumber && primaryContact.phoneNumber !== phoneNumber);
                if (isNewInformation) {
                    // Check if there's a need to link two primary contacts
                    const otherPrimaryContact = allExistingContacts.find(contact => contact.id !== primaryContact?.id && contact.linkPrecedence === 'primary');
                    if (otherPrimaryContact) {
                        // Determine which contact should become secondary (e.g., based on creation date)
                        const contactToBecomeSecondary = primaryContact.createdAt > otherPrimaryContact.createdAt ? primaryContact : otherPrimaryContact;
                        await updateContact(contactToBecomeSecondary.id, primaryContact.id, 'secondary');
                        primaryContact = contactToBecomeSecondary === primaryContact ? otherPrimaryContact : primaryContact;
                    } else {
                        // Create a new secondary contact linked to the primary
                        await createContact(email, phoneNumber, 'secondary', primaryContact.id);
                    }
                }
            } else {
                // If no primary contact exists among the found, create a new primary contact
                primaryContact = await createContact(email, phoneNumber, 'primary');
            }
        } else {
            // No existing contacts found, create a new primary contact
            primaryContact = await createContact(email, phoneNumber, 'primary');
        }
        console.log('here 2', )
        // Consolidate contacts for response
        const consolidatedContact: ConsolidatedContactResponse = await consolidateContacts(primaryContact?.id || 0);

        res.status(200).json(consolidatedContact);
    } catch (error) {
        console.error('Error in identifyHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
