import React, { SyntheticEvent } from "react";
export interface AccountCardProps {
    account: {
        name?: string;
        avatarUrl?: string;
    };
    onClick?: (event: SyntheticEvent) => void;
    subtitle?: string;
    size?: "medium" | "large";
}
export declare function AccountCard({ account, onClick, subtitle, size }: AccountCardProps): React.JSX.Element;
export default AccountCard;
