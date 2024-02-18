import pool from '../db/db';

export const findContactByEmailOrPhone = async (email?: string, phoneNumber?: string) => {
    try {
        const query = `
            SELECT * FROM contacts
            WHERE email = $1 OR phoneNumber = $2;
        `;
        const values = [email, phoneNumber];
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('Error finding contact by email or phone:', error);
        throw error; 
    }
};

export const createContact = async (email: string | null, phoneNumber: string | null, linkPrecedence: 'primary' | 'secondary' = 'primary', linkedId: number | null = null) => {
    try {
        const query = `
            INSERT INTO contacts (email, phoneNumber, linkPrecedence, linkedId)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [email, phoneNumber, linkPrecedence, linkedId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('Error creating contact:', error);
        throw error;
    }
};

export const updateContact = async (id: number, linkedId: number | null, linkPrecedence: 'primary' | 'secondary') => {
    try {
        const query = `
            UPDATE contacts
            SET linkedId = $2, linkPrecedence = $3, updatedAt = NOW()
            WHERE id = $1
            RETURNING *;
        `;
        const values = [id, linkedId, linkPrecedence];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
    }
};

export const consolidateContacts = async (primaryContactId: number) => {
    try {
        const primaryContactQuery = `
            SELECT * FROM contacts
            WHERE id = $1;
        `;
        const { rows: [primaryContact] } = await pool.query(primaryContactQuery, [primaryContactId]);

        if (!primaryContact) {
            throw new Error('Primary contact not found');
        }

        const secondaryContactsQuery = `
            SELECT * FROM contacts
            WHERE linkedId = $1;
        `;
        const { rows: secondaryContacts } = await pool.query(secondaryContactsQuery, [primaryContactId]);

        const emails = [primaryContact.email, ...secondaryContacts.map(contact => contact.email).filter(email => email)];
        const phoneNumbers = [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber).filter(phoneNumber => phoneNumber)];

        const secondaryContactIds = secondaryContacts.map(contact => contact.id);

        return {
            primaryContactId: primaryContactId,
            emails,
            phoneNumbers,
            secondaryContactIds
        };
    } catch (error) {
        console.error('Error consolidating contacts:', error);
        throw error;
    }
};
